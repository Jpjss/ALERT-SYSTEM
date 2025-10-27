#!/bin/bash

# ========================================
# Script de instalação do Monitor no Servidor do Cliente
# ========================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Instalador do Monitor de Status - Sistema de Alertas     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "[AVISO] Recomendado executar como root para instalação completa"
    echo "Execute: sudo bash install_client.sh"
    echo ""
fi

# Diretório de instalação
INSTALL_DIR="/opt/alert-monitor"
SERVICE_NAME="alert-monitor"

echo "[1/6] Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "[ERRO] Python 3 não encontrado. Instalando..."
    apt-get update
    apt-get install -y python3 python3-pip python3-venv
else
    echo "✓ Python 3 encontrado: $(python3 --version)"
fi

echo ""
echo "[2/6] Criando diretório de instalação..."
mkdir -p $INSTALL_DIR
cp client_monitor.py $INSTALL_DIR/
cp requirements_client.txt $INSTALL_DIR/requirements.txt

echo ""
echo "[3/6] Criando ambiente virtual Python..."
cd $INSTALL_DIR
python3 -m venv venv
source venv/bin/activate

echo ""
echo "[4/6] Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "[5/6] Configurando variáveis de ambiente..."

# Solicita informações do cliente
read -p "ID do Cliente (ex: CLI001): " client_id
read -p "Nome do Cliente: " client_name
read -p "URL da API (ex: https://alerts.suaempresa.com): " api_url
read -p "Token da API: " api_token
read -p "Intervalo de verificação em segundos (padrão: 120): " check_interval
check_interval=${check_interval:-120}

# Cria arquivo .env
cat > $INSTALL_DIR/.env << EOF
CLIENT_ID=$client_id
CLIENT_NAME=$client_name
API_URL=$api_url
API_TOKEN=$api_token
CHECK_INTERVAL=$check_interval
EOF

chmod 600 $INSTALL_DIR/.env
echo "✓ Arquivo .env criado"

echo ""
echo "[6/6] Configurando serviço systemd..."

# Cria arquivo de serviço systemd
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Monitor de Status do Cliente - Sistema de Alertas
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment="PATH=$INSTALL_DIR/venv/bin"
ExecStart=$INSTALL_DIR/venv/bin/python3 $INSTALL_DIR/client_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recarrega systemd e inicia serviço
systemctl daemon-reload
systemctl enable $SERVICE_NAME.service
systemctl start $SERVICE_NAME.service

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Instalação Concluída com Sucesso!            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Cliente: $client_name ($client_id)"
echo "Diretório: $INSTALL_DIR"
echo "Serviço: $SERVICE_NAME"
echo ""
echo "Comandos úteis:"
echo "  - Ver status:  systemctl status $SERVICE_NAME"
echo "  - Ver logs:    journalctl -u $SERVICE_NAME -f"
echo "  - Parar:       systemctl stop $SERVICE_NAME"
echo "  - Reiniciar:   systemctl restart $SERVICE_NAME"
echo "  - Desabilitar: systemctl disable $SERVICE_NAME"
echo ""
echo "O monitor está rodando em background e enviando dados para:"
echo "$api_url"
echo ""
