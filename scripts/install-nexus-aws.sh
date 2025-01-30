#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update system and install necessary packages
sudo yum update -y
sudo yum install -y java-1.8.0-openjdk-devel wget

# Create Nexus user
sudo useradd -r -m -U -d /opt/nexus -s /bin/bash nexus

# Set up swap space (recommended for t2.micro/small instances)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Download and extract Nexus
NEXUS_VERSION="3.51.0-01"
cd /opt
sudo wget https://download.sonatype.com/nexus/3/nexus-${NEXUS_VERSION}-unix.tar.gz
sudo tar -xvf nexus-${NEXUS_VERSION}-unix.tar.gz
sudo rm nexus-${NEXUS_VERSION}-unix.tar.gz
sudo mv nexus-${NEXUS_VERSION} nexus

# Set ownership
sudo chown -R nexus:nexus /opt/nexus
sudo chown -R nexus:nexus /opt/sonatype-work

# Configure system limits
echo "nexus - nofile 65536" | sudo tee -a /etc/security/limits.conf

# Create systemd service file
sudo tee /etc/systemd/system/nexus.service > /dev/null <<EOT
[Unit]
Description=Nexus Repository Manager
After=network.target

[Service]
Type=forking
LimitNOFILE=65536
ExecStart=/opt/nexus/bin/nexus start
ExecStop=/opt/nexus/bin/nexus stop
User=nexus
Restart=on-abort
TimeoutSec=600

[Install]
WantedBy=multi-user.target
EOT

# Configure Nexus to run as nexus user
sudo sed -i 's/#run_as_user=""/run_as_user="nexus"/' /opt/nexus/bin/nexus.rc

# Set NEXUS_HOME
echo "NEXUS_HOME=/opt/nexus" | sudo tee -a /etc/environment

# Configure JVM memory (adjust based on instance size)
sudo sed -i 's/-Xms2703m/-Xms1024m/g' /opt/nexus/bin/nexus.vmoptions
sudo sed -i 's/-Xmx2703m/-Xmx1024m/g' /opt/nexus/bin/nexus.vmoptions
sudo sed -i 's/-XX:MaxDirectMemorySize=2703m/-XX:MaxDirectMemorySize=1024m/g' /opt/nexus/bin/nexus.vmoptions

# Reload systemd manager
sudo systemctl daemon-reload

# Enable and start Nexus service
sudo systemctl enable nexus
sudo systemctl start nexus

# Print status and important information
echo "Nexus installation completed. Please note:"
echo "1. Initial startup may take a few minutes"
echo "2. Check status with: sudo systemctl status nexus"
echo "3. Access Nexus at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8081"
echo "4. Default credentials: admin / admin123"
echo "5. Check logs with: tail -f /opt/sonatype-work/nexus3/log/nexus.log"
echo "6. Remember to configure security group to allow port 8081" 