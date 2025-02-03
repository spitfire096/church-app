#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update system
sudo dnf update -y

# Install Java 8 (Amazon Linux 2023 specific)
sudo dnf install -y java-1.8.0-amazon-corretto-devel wget

# Create Nexus user
sudo useradd -r -m -U -d /opt/nexus -s /bin/bash nexus

# Create all required directories
sudo mkdir -p /opt/nexus
sudo mkdir -p /opt/sonatype-work/nexus3/log
sudo mkdir -p /opt/sonatype-work/nexus3/tmp

# Download and extract Nexus
NEXUS_VERSION="3.51.0-01"
cd /opt
sudo wget https://download.sonatype.com/nexus/3/nexus-${NEXUS_VERSION}-unix.tar.gz
sudo tar -xvf nexus-${NEXUS_VERSION}-unix.tar.gz
sudo rm nexus-${NEXUS_VERSION}-unix.tar.gz
sudo cp -r nexus-${NEXUS_VERSION}/* nexus/
sudo rm -rf nexus-${NEXUS_VERSION}

# Set correct permissions
sudo chown -R nexus:nexus /opt/nexus
sudo chown -R nexus:nexus /opt/sonatype-work

# Create simple vmoptions file
sudo tee /opt/nexus/bin/nexus.vmoptions > /dev/null <<EOT
-Xms512m
-Xmx512m
-XX:MaxDirectMemorySize=512m
-Djava.net.preferIPv4Stack=true
-Dkaraf.data=/opt/sonatype-work/nexus3
-Dkaraf.log=/opt/sonatype-work/nexus3/log
-Djava.io.tmpdir=/opt/sonatype-work/nexus3/tmp
EOT

# Configure Nexus to run as nexus user
echo 'run_as_user="nexus"' | sudo tee /opt/nexus/bin/nexus.rc

# Make nexus executable
sudo chmod +x /opt/nexus/bin/nexus

# Create systemd service file
sudo tee /etc/systemd/system/nexus.service > /dev/null <<EOT
[Unit]
Description=Nexus Repository Manager
After=network.target

[Service]
Type=forking
LimitNOFILE=65536
LimitNPROC=4096
Environment="INSTALL4J_JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto"
Environment="JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto"
ExecStart=/opt/nexus/bin/nexus start
ExecStop=/opt/nexus/bin/nexus stop
User=nexus
Group=nexus
Restart=on-failure
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOT

# Reload and start
sudo systemctl daemon-reload
sudo systemctl enable nexus
sudo systemctl start nexus

# Print status and important information
echo "Nexus installation completed. Please note:"
echo "1. Initial startup may take a few minutes"
echo "2. Check status with: sudo systemctl status nexus"
echo "3. Check logs with: sudo tail -f /opt/sonatype-work/nexus3/log/nexus.log"
echo "4. Initial admin password can be found at: /opt/sonatype-work/nexus3/admin.password"
echo "5. Access Nexus at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8081"
echo "6. Remember to configure security group to allow port 8081" 