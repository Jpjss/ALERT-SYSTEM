#!/bin/bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database
sudo -u postgres psql -c "CREATE DATABASE alert_system;"
sudo -u postgres psql -c "CREATE USER alert_user WITH PASSWORD 'alert_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alert_system TO alert_user;"

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
mkdir -p /var/www/alert-system
cd /var/www/alert-system

echo 'âœ… Servidor configurado com sucesso!'
echo 'PostgreSQL, Node.js e PM2 instalados'
echo 'Database: alert_system'
echo 'User: alert_user'
echo 'Agora vocÃª pode fazer deploy da aplicaÃ§Ã£o'
