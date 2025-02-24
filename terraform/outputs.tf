output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "alb_dns_name" {
  description = "DNS name of the application load balancer"
  value       = module.ecs.alb_dns_name
}

output "ecr_repository_urls" {
  description = "URLs of the ECR repositories"
  value       = module.ecr.repository_urls
} 