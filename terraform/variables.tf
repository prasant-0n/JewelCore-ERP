variable "aws_region" {
  description = "AWS deployment region for JewelCore cluster"
  type        = string
  default     = "ap-south-1" # Mumbai primary financial hub
}

variable "environment" {
  description = "Environment identifier (development, staging, production)"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "jewelcore-prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated cluster VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "app_node_instance_types" {
  description = "EC2 instance types for general stateless application pods"
  type        = list(string)
  default     = ["m6i.xlarge", "m5.xlarge"]
}

variable "db_node_instance_types" {
  description = "EC2 instance types for memory-optimized PostgreSQL StatefulSet"
  type        = list(string)
  default     = ["r6i.xlarge"]
}

variable "min_nodes" {
  description = "Minimum nodes in application autoscaling group"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum nodes in application autoscaling group"
  type        = number
  default     = 12
}

variable "desired_nodes" {
  description = "Desired baseline nodes in application group"
  type        = number
  default     = 4
}

variable "backup_retention_days" {
  description = "S3 backup snapshot retention lifecycle in days"
  type        = number
  default     = 90
}
