#!/bin/bash

# Script para configurar o cron job do monitor de alertas
# Executa: chmod +x setup_cron.sh && ./setup_cron.sh

echo "Configurando cron job para monitor de alertas..."

# Define o caminho do script Python
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/monitor.py"
PYTHON_PATH=$(which python3)

# Cria entrada do cron (executa a cada 15 minutos)
CRON_JOB="*/15 * * * * cd $(dirname $SCRIPT_PATH) && $PYTHON_PATH $SCRIPT_PATH >> /var/log/alert_monitor.log 2>&1"

# Adiciona ao crontab
(crontab -l 2>/dev/null | grep -v "monitor.py"; echo "$CRON_JOB") | crontab -

echo "Cron job configurado com sucesso!"
echo "O monitor será executado a cada 15 minutos"
echo "Logs disponíveis em: /var/log/alert_monitor.log"
echo ""
echo "Para verificar: crontab -l"
echo "Para remover: crontab -e (e deletar a linha)"
