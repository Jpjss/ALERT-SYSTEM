#!/bin/bash

# ============================================
# Script de Deploy Automatizado do Monitor
# Instala automaticamente nos servidores dos clientes
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_LIST="${SCRIPT_DIR}/clients.txt"
LOG_FILE="${SCRIPT_DIR}/deploy_$(date +%Y%m%d_%H%M%S).log"

# Função de log
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Verificar se arquivo de clientes existe
if [ ! -f "$CLIENT_LIST" ]; then
    error "Arquivo clients.txt não encontrado!"
    echo "Crie o arquivo clients.txt com o formato:"
    echo "cliente1.com:CLI001:token_cli001_abc123"
    echo "cliente2.com:CLI002:token_cli002_def456"
    exit 1
fi

# Função para instalar em um cliente
install_on_client() {
    local host=$1
    local client_id=$2
    local api_token=$3
    local user=${4:-root}  # Default root

    log "Iniciando instalação em $host (Cliente: $client_id)"

    # Testar conexão
    if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$user@$host" "echo 'Conexão OK'" >/dev/null 2>&1; then
        error "Não foi possível conectar em $host"
        return 1
    fi

    # Criar diretório remoto
    ssh "$user@$host" "mkdir -p /opt/alert-monitor" || {
        error "Falha ao criar diretório em $host"
        return 1
    }

    # Copiar arquivos
    scp "${SCRIPT_DIR}/client_monitor.py" "$user@$host:/opt/alert-monitor/" || {
        error "Falha ao copiar client_monitor.py para $host"
        return 1
    }

    scp "${SCRIPT_DIR}/requirements_client.txt" "$user@$host:/opt/alert-monitor/" || {
        error "Falha ao copiar requirements para $host"
        return 1
    }

    # Criar .env no servidor remoto
    ssh "$user@$host" "cat > /opt/alert-monitor/.env << EOF
CLIENT_ID=$client_id
CLIENT_NAME=Cliente $client_id
API_URL=https://seu-servidor.com
API_TOKEN=$api_token
CHECK_INTERVAL=120
EOF" || {
        error "Falha ao criar .env em $host"
        return 1
    }

    # Instalar dependências
    ssh "$user@$host" "cd /opt/alert-monitor && python3 -m venv venv && source venv/bin/activate && pip install -r requirements_client.txt" || {
        error "Falha ao instalar dependências em $host"
        return 1
    }

    # Criar serviço systemd
    ssh "$user@$host" "cat > /etc/systemd/system/alert-monitor.service << EOF
[Unit]
Description=Monitor de Status do Cliente
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/alert-monitor
Environment=\"PATH=/opt/alert-monitor/venv/bin\"
ExecStart=/opt/alert-monitor/venv/bin/python3 /opt/alert-monitor/client_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF" || {
        error "Falha ao criar serviço systemd em $host"
        return 1
    }

    # Recarregar systemd e iniciar serviço
    ssh "$user@$host" "systemctl daemon-reload && systemctl enable alert-monitor && systemctl start alert-monitor" || {
        error "Falha ao iniciar serviço em $host"
        return 1
    }

    # Verificar se está rodando
    sleep 5
    if ssh "$user@$host" "systemctl is-active alert-monitor" | grep -q "active"; then
        success "Monitor instalado e rodando em $host"
        return 0
    else
        error "Serviço não iniciou corretamente em $host"
        ssh "$user@$host" "journalctl -u alert-monitor -n 20" || true
        return 1
    fi
}

# Função principal
main() {
    log "=== Iniciando Deploy Automatizado do Monitor ==="
    log "Log file: $LOG_FILE"

    local success_count=0
    local total_count=0

    # Ler lista de clientes
    while IFS=':' read -r host client_id api_token user; do
        # Pular linhas vazias ou comentários
        [[ -z "$host" || "$host" =~ ^[[:space:]]*# ]] && continue

        total_count=$((total_count + 1))

        if install_on_client "$host" "$client_id" "$api_token" "$user"; then
            success_count=$((success_count + 1))
        fi

        # Pequena pausa entre instalações
        sleep 2
    done < "$CLIENT_LIST"

    log "=== Deploy Finalizado ==="
    log "Total de clientes: $total_count"
    log "Sucessos: $success_count"
    log "Falhas: $((total_count - success_count))"

    if [ $success_count -eq $total_count ]; then
        success "Todos os deploys foram bem-sucedidos!"
        exit 0
    else
        warning "Alguns deploys falharam. Verifique o log: $LOG_FILE"
        exit 1
    fi
}

# Verificar se tem argumentos
if [ $# -eq 0 ]; then
    main
else
    case "$1" in
        "test")
            log "Modo teste - verificando conexões apenas"
            while IFS=':' read -r host client_id api_token user; do
                [[ -z "$host" || "$host" =~ ^[[:space:]]*# ]] && continue
                if ssh -o ConnectTimeout=5 "$user@$host" "echo 'OK'" >/dev/null 2>&1; then
                    success "Conexão OK: $host"
                else
                    error "Conexão falhou: $host"
                fi
            done < "$CLIENT_LIST"
            ;;
        "status")
            log "Verificando status dos serviços"
            while IFS=':' read -r host client_id api_token user; do
                [[ -z "$host" || "$host" =~ ^[[:space:]]*# ]] && continue
                if ssh "$user@$host" "systemctl is-active alert-monitor 2>/dev/null" | grep -q "active"; then
                    success "Ativo: $host"
                else
                    error "Inativo: $host"
                fi
            done < "$CLIENT_LIST"
            ;;
        *)
            echo "Uso: $0 [test|status]"
            echo "  (sem argumentos) - executa deploy completo"
            echo "  test - testa conexões apenas"
            echo "  status - verifica status dos serviços"
            exit 1
            ;;
    esac
fi