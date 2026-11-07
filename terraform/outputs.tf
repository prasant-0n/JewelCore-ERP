output "cluster_name" {
  description = "EKS Cluster identifier"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Kubernetes API server endpoint URL"
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "ID of the dedicated VPC"
  value       = module.vpc.vpc_id
}

output "backup_bucket_name" {
  description = "S3 disaster recovery bucket name"
  value       = aws_s3_bucket.backups.id
}

output "backup_bucket_arn" {
  description = "ARN of the S3 disaster recovery bucket"
  value       = aws_s3_bucket.backups.arn
}

output "kubeconfig_command" {
  description = "AWS CLI command to configure local kubectl context"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
