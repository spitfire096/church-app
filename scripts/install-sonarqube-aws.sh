#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update system and install necessary packages
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk wget unzip postgresql postgresql-contrib

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE USER sonarqube WITH ENCRYPTED PASSWORD 'sonarqube';"
sudo -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonarqube;"

# Create SonarQube user
sudo useradd -r -m -U -d /opt/sonarqube -s /bin/bash sonarqube

# Download and extract SonarQube
SONAR_VERSION="10.3.0.82913"
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
vm.max_map_count=524288
fs.file-max=131072
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
echo "5. Check logs with: sudo tail -f /opt/sonarqube/logs/sonar.log"
echo "6. Remember to configure security group to allow port 9000" 