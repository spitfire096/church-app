#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update system and install necessary packages
sudo yum update -y
sudo yum install -y java-11-openjdk-devel wget unzip postgresql postgresql-server

# Initialize PostgreSQL
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create SonarQube user
sudo useradd -r -m -U -d /opt/sonarqube -s /bin/bash sonarqube

# Set up swap space (recommended for t2.micro/small instances)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE USER sonarqube WITH ENCRYPTED PASSWORD 'sonarqube';"
sudo -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonarqube;"
sudo -u postgres psql -c "ALTER USER sonarqube WITH SUPERUSER;"

# Download and extract SonarQube
SONAR_VERSION="9.9.0.65466"
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-${SONAR_VERSION}.zip
sudo unzip sonarqube-${SONAR_VERSION}.zip
sudo mv sonarqube-${SONAR_VERSION} sonarqube
sudo rm sonarqube-${SONAR_VERSION}.zip

# Set ownership
sudo chown -R sonarqube:sonarqube /opt/sonarqube

# Configure SonarQube
sudo tee -a /opt/sonarqube/conf/sonar.properties > /dev/null <<EOT
sonar.jdbc.username=sonarqube
sonar.jdbc.password=sonarqube
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
sonar.web.javaAdditionalOpts=-server
sonar.web.host=0.0.0.0
EOT

# Configure system limits
sudo tee -a /etc/security/limits.conf > /dev/null <<EOT
sonarqube   -   nofile   65536
sonarqube   -   nproc    4096
EOT

sudo tee -a /etc/sysctl.conf > /dev/null <<EOT
vm.max_map_count=262144
fs.file-max=65536
EOT

sudo sysctl -p

# Create systemd service file
sudo tee /etc/systemd/system/sonarqube.service > /dev/null <<EOT
[Unit]
Description=SonarQube service
After=syslog.target network.target postgresql.service

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=sonarqube
Group=sonarqube
Restart=always
LimitNOFILE=65536
LimitNPROC=4096
TimeoutStartSec=600

[Install]
WantedBy=multi-user.target
EOT

# Reload systemd manager
sudo systemctl daemon-reload

# Enable and start SonarQube
sudo systemctl enable sonarqube
sudo systemctl start sonarqube

# Print status and important information
echo "SonarQube installation completed. Please note:"
echo "1. Initial startup may take a few minutes"
echo "2. Check status with: sudo systemctl status sonarqube"
echo "3. Access SonarQube at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9000"
echo "4. Default credentials: admin / admin"
echo "5. Check logs with: tail -f /opt/sonarqube/logs/sonar.log"
echo "6. Remember to configure security group to allow port 9000" 