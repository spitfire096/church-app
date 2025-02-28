#!/bin/bash
# Install dependencies
sudo yum update -y
sudo yum install -y nodejs npm

# Create app directory
sudo mkdir -p /var/app
sudo chown -R nodejs:nodejs /var/app 