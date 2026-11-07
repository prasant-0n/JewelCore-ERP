terraform {
  required_version: ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }

  backend "s3" {
    bucket         = "jewelcore-terraform-state-prod"
    key            = "atelier-erp/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "jewelcore-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "JewelCore-Atelier-ERP"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "JewelCore-SRE"
    }
  }
}

# --- VPC & Network Topography (Multi-AZ Resilience) ---
data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.cluster_name}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  one_nat_gateway_per_az = var.environment == "production"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = 1
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = 1
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# --- AWS EKS High-Availability Kubernetes Cluster ---
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    # Core Application Pool (API, Web, Redis)
    general = {
      instance_types = var.app_node_instance_types
      min_size       = var.min_nodes
      max_size       = var.max_nodes
      desired_size   = var.desired_nodes

      labels = {
        role = "general-workloads"
      }
    }

    # High-Performance Database Storage Pool (PostgreSQL StatefulSet)
    database = {
      instance_types = var.db_node_instance_types
      min_size       = 1
      max_size       = 2
      desired_size   = 1

      labels = {
        role = "database-storage"
      }

      taints = [
        {
          key    = "dedicated"
          value  = "database"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
}

# --- Encrypted Disaster Recovery S3 Bucket with Lifecycle Retention ---
resource "aws_s3_bucket" "backups" {
  bucket        = "jewelcore-database-backups-${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "expire-old-dr-snapshots"
    status = "Enabled"

    expiration {
      days = var.backup_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = 14
    }
  }
}
