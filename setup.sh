#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/filecabinet
sudo chown ubuntu:ubuntu /var/www/filecabinet

# Clone your repository (replace with your repo URL)
cd /var/www/filecabinet
git clone https://github.com/magicianjarden/filecabinet.git .

# Install dependencies and build
npm install
npm run build

# Start the app
pm2 start npm --name "filecabinet" -- start
pm2 save
pm2 startup

# Install and configure Nginx
sudo apt install nginx -y
sudo tee /etc/nginx/sites-available/filecabinet > /dev/null <<EOT
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

sudo ln -s /etc/nginx/sites-available/filecabinet /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "Setup complete! Your app should be running at http://$(curl -s ifconfig.me)" 