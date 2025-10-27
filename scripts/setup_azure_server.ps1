# Script para configurar ALERT SYSTEM no servidor Azure
param(
    [string]$ResourceGroup = "alert-system-test-rg",
    [string]$VMName = "alert-test-vm",
    [string]$ProjectPath = "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM"
)

Write-Host "=== Configurando ALERT SYSTEM no Servidor Azure ===" -ForegroundColor Green

# Obter IP público
Write-Host "Obtendo IP do servidor..."
$ip = az vm show --resource-group $ResourceGroup --name $VMName --show-details --query [publicIps] --output tsv

if (-not $ip) {
    Write-Host "❌ Não foi possível obter o IP do servidor" -ForegroundColor Red
    exit 1
}

Write-Host "IP do servidor: $ip" -ForegroundColor Cyan

# Comandos para configurar o servidor
$setupCommands = @"
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

echo '✅ Servidor configurado com sucesso!'
echo 'PostgreSQL, Node.js e PM2 instalados'
echo 'Database: alert_system'
echo 'User: alert_user'
echo 'Agora você pode fazer deploy da aplicação'
"@

# Salvar script de configuração
$setupCommands | Out-File -FilePath "$ProjectPath\scripts\setup_server.sh" -Encoding UTF8

Write-Host "📄 Script de configuração criado: scripts/setup_server.sh" -ForegroundColor Green
Write-Host ""
Write-Host "Para configurar o servidor, execute:" -ForegroundColor Yellow
Write-Host "scp scripts/setup_server.sh azureuser@$($ip):~/setup.sh" -ForegroundColor Yellow
Write-Host "ssh azureuser@$($ip) 'chmod +x setup.sh && sudo ./setup.sh'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para fazer deploy da aplicação:" -ForegroundColor Yellow
Write-Host "scp -r . azureuser@$($ip):/var/www/alert-system/" -ForegroundColor Yellow
Write-Host "ssh azureuser@$($ip) 'cd /var/www/alert-system && npm install && npm run build'" -ForegroundColor Yellow