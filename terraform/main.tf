terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket         = "church-app-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "church-app-terraform-locks"
    kms_key_id     = "alias/terraform-bucket-key"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  alb_subnet_ids = module.vpc.public_subnet_ids
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
} 