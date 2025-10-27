# Script para criar servidor de teste na Azure
param(
    [string]$ResourceGroup = "alert-system-test-rg",
    [string]$Location = "eastus",
    [string]$VMName = "alert-test-vm",
    [string]$VMSize = "Standard_B1s",
    [string]$Image = "Ubuntu2204"
)

Write-Host "=== Criando Servidor de Teste na Azure ===" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Localização: $Location"
Write-Host "VM Name: $VMName"
Write-Host "VM Size: $VMSize"
Write-Host "Imagem: $Image"
Write-Host ""

# Verificar se está logado
Write-Host "Verificando autenticação..."
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Você precisa fazer login na Azure primeiro!" -ForegroundColor Red
    Write-Host "Execute: az login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Autenticado na Azure" -ForegroundColor Green

# Criar Resource Group
Write-Host "Criando Resource Group..."
az group create --name $ResourceGroup --location $Location

# Criar VM
Write-Host "Criando Virtual Machine..."
az vm create `
    --resource-group $ResourceGroup `
    --name $VMName `
    --size $VMSize `
    --image $Image `
    --admin-username azureuser `
    --generate-ssh-keys `
    --public-ip-sku Standard

# Abrir porta 80 e 443
Write-Host "Configurando firewall (porta 80 e 443)..."
az vm open-port --resource-group $ResourceGroup --name $VMName --port 80,443

# Obter IP público
Write-Host "Obtendo IP público..."
$ip = az vm show --resource-group $ResourceGroup --name $VMName --show-details --query [publicIps] --output tsv

Write-Host ""
Write-Host "🎉 Servidor criado com sucesso!" -ForegroundColor Green
Write-Host "IP Público: $ip" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para conectar via SSH:" -ForegroundColor Yellow
Write-Host "ssh azureuser@$ip" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para limpar recursos depois do teste:" -ForegroundColor Yellow
Write-Host "az group delete --name $ResourceGroup --yes --no-wait" -ForegroundColor Yellow