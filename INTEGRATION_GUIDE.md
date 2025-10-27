# 🚀 Guia Completo: Integração com Servidores dos Clientes

Este guia explica como integrar o sistema de monitoramento com os servidores reais dos seus clientes para obter informações em tempo real.

## 📋 Visão Geral da Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Servidor do   │    │   Agente Cliente  │    │   Dashboard     │
│    Cliente      │◄──►│  (client_monitor)│◄──►│   Web (Next.js) │
│                 │    │                   │    │                 │
│ • Sistema Linux │    │ • Python + psutil │    │ • React + Socket│
│ • Windows       │    │ • Socket.IO       │    │ • Tempo Real    │
│ • macOS         │    │ • API REST        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────────────┐
                    │   Banco de Dados   │
                    │   PostgreSQL       │
                    │ • Status clientes  │
                    │ • Alertas          │
                    │ • Métricas         │
                    │ • Histórico        │
                    └────────────────────┘
```

## 🔧 Componentes do Sistema

### 1. **Agente Cliente** (`client_monitor.py`)
- **Função**: Coleta métricas e envia para o servidor central
- **Tecnologias**: Python 3.8+, psutil, requests, socket.io-client
- **Métricas coletadas**:
  - CPU usage (%)
  - Memory usage (%)
  - Disk usage (%)
  - Uptime (horas)
  - Status de conectividade

### 2. **API Central** (Next.js API Routes)
- **`/api/status/update`**: Recebe status dos clientes
- **`/api/alerts`**: Recebe alertas dos clientes
- **`/api/status/all`**: Fornece status para o mapa
- **Autenticação**: Token-based por cliente

### 3. **Dashboard Web** (Next.js + React)
- **Tempo real**: Socket.IO para atualizações live
- **Mapas**: Leaflet com localização dos clientes
- **Alertas**: Sistema de notificações
- **Métricas**: Gráficos e estatísticas

### 4. **Banco de Dados** (PostgreSQL)
- **Tabelas principais**:
  - `clients`: Dados dos clientes e tokens
  - `client_status`: Status atual dos clientes
  - `alerts`: Histórico de alertas
  - `metrics_history`: Histórico de métricas

## 🚀 Instalação Passo a Passo

### Pré-requisitos

1. **Servidor Central**:
   - Node.js 18+
   - PostgreSQL 12+
   - PM2 ou similar para produção

2. **Servidores dos Clientes**:
   - Python 3.8+
   - Acesso SSH
   - Permissões para instalar pacotes

### Passo 1: Configurar Banco de Dados

```bash
# Executar scripts SQL na ordem
psql -U postgres -d alerts_db -f scripts/001_create_alerts_schema.sql
psql -U postgres -d alerts_db -f scripts/002_seed_alert_rules.sql
psql -U postgres -d alerts_db -f scripts/003_seed_sample_data.sql
psql -U postgres -d alerts_db -f scripts/004_create_client_status_table.sql
psql -U postgres -d alerts_db -f scripts/005_create_metrics_history_table.sql
psql -U postgres -d alerts_db -f scripts/006_create_clients_table.sql
```

### Passo 2: Configurar Servidor Central

1. **Instalar dependências**:
```bash
pnpm install
```

2. **Configurar variáveis de ambiente** (`.env.local`):
```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/alerts_db

# API Token secreto (compartilhado por todos os clientes)
API_SECRET_TOKEN=seu_token_super_secreto_aqui

# Email para notificações
NOTIFICATION_EMAIL_RECIPIENT=alerts@suaempresa.com

# SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua_senha_app
```

3. **Iniciar servidor**:
```bash
# Desenvolvimento
pnpm run dev

# Produção
pnpm run build
pnpm run start
```

### Passo 3: Instalar Agentes nos Clientes

#### Opção A: Deploy Automatizado (Recomendado)

1. **Configurar lista de clientes** (`scripts/clients.txt`):
```
cliente1.com:CLI001:token_cli001_abc123
cliente2.com:CLI002:token_cli002_def456:root
cliente3.com:CLI003:token_cli003_ghi789:admin
```

2. **Executar deploy**:
```bash
chmod +x scripts/deploy_monitor.sh
./scripts/deploy_monitor.sh
```

3. **Verificar status**:
```bash
./scripts/deploy_monitor.sh status
```

#### Opção B: Instalação Manual

Para cada cliente, execute:

```bash
# 1. Conectar via SSH
ssh user@cliente.com

# 2. Instalar Python e dependências
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv

# 3. Criar diretório
sudo mkdir -p /opt/alert-monitor
cd /opt/alert-monitor

# 4. Baixar arquivos
wget https://seu-servidor.com/scripts/client_monitor.py
wget https://seu-servidor.com/scripts/requirements_client.txt

# 5. Criar ambiente virtual
sudo python3 -m venv venv
source venv/bin/activate
pip install -r requirements_client.txt

# 6. Configurar .env
sudo tee .env > /dev/null <<EOF
CLIENT_ID=CLI001
CLIENT_NAME=Nome do Cliente
API_URL=https://seu-servidor.com
API_TOKEN=token_cli001_abc123
CHECK_INTERVAL=120
EOF

# 7. Configurar como serviço
sudo tee /etc/systemd/system/alert-monitor.service > /dev/null <<EOF
[Unit]
Description=Monitor de Status do Cliente
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/alert-monitor
Environment="PATH=/opt/alert-monitor/venv/bin"
ExecStart=/opt/alert-monitor/venv/bin/python3 /opt/alert-monitor/client_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 8. Iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable alert-monitor
sudo systemctl start alert-monitor
```

## 🔐 Sistema de Autenticação

### Tokens de API

Cada cliente tem um token único para autenticação:

```sql
-- Ver tokens dos clientes
SELECT client_id, name, api_token FROM clients;
```

### Renovação de Tokens

Para renovar um token:

```sql
UPDATE clients
SET api_token = 'novo_token_aqui'
WHERE client_id = 'CLI001';
```

### Segurança

- ✅ Tokens únicos por cliente
- ✅ Comunicação HTTPS obrigatória
- ✅ Rate limiting nas APIs
- ✅ Logs de acesso
- ✅ Validação de origem (opcional)

## 📡 Comunicação em Tempo Real

### Socket.IO Events

O sistema usa Socket.IO para atualizações em tempo real:

```javascript
// Cliente se conecta
socket.emit('join-alerts');  // Para alertas
socket.emit('join-status');  // Para status

// Recebe atualizações
socket.on('alert-update', (data) => {
  console.log('Novo alerta:', data);
});

socket.on('status-update', (data) => {
  console.log('Status atualizado:', data);
});
```

### Tipos de Eventos

1. **alert-update**: Novo alerta criado
2. **status-update**: Status do cliente mudou
3. **metrics-update**: Novas métricas recebidas

## 📊 Monitoramento e Alertas

### Tipos de Alertas Automáticos

O agente cliente gera alertas baseados em thresholds:

| Condição | Tipo | Severidade | Threshold |
|----------|------|------------|-----------|
| Sem internet | `no_internet` | `high` | - |
| CPU > 90% | `cpu_high` | `medium` | 90% |
| Memória > 90% | `memory_high` | `high` | 90% |
| Disco > 90% | `disk_space_low` | `critical` | 90% |
| Memória > 95% | `memory_critical` | `critical` | 95% |

### Configuração de Thresholds

Thresholds podem ser customizados no código do agente:

```python
# Em client_monitor.py
CPU_THRESHOLD = 90  # %
MEMORY_THRESHOLD = 90  # %
DISK_THRESHOLD = 90  # %
```

### Notificações

Alertas críticos disparam notificações:

- 📧 **Email**: Para equipe técnica
- 💬 **WhatsApp**: Para equipe de plantão (opcional)
- 🔔 **Dashboard**: Notificações em tempo real

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Agente não conecta na API

```bash
# Verificar conectividade
curl -H "Authorization: Bearer SEU_TOKEN" https://seu-servidor.com/api/status/update

# Verificar logs do agente
sudo journalctl -u alert-monitor -f
```

#### 2. Dados não aparecem no dashboard

```bash
# Verificar se API está respondendo
curl https://seu-servidor.com/api/status/all

# Verificar banco de dados
psql -d alerts_db -c "SELECT * FROM client_status LIMIT 5;"
```

#### 3. Socket.IO não funciona

```bash
# Verificar se servidor Socket.IO está rodando
netstat -tlnp | grep :3000

# Testar conexão no browser
# Console: const socket = io(); socket.on('connect', () => console.log('OK'));
```

### Logs e Debug

#### Servidor Central
```bash
# Logs da aplicação
pm2 logs alert-system

# Logs do banco
tail -f /var/log/postgresql/postgresql-*.log
```

#### Agente Cliente
```bash
# Status do serviço
sudo systemctl status alert-monitor

# Logs em tempo real
sudo journalctl -u alert-monitor -f

# Últimas 50 linhas
sudo journalctl -u alert-monitor -n 50
```

## 📈 Escalabilidade

### Para Muitos Clientes

1. **Load Balancer**: Nginx ou HAProxy
2. **Banco**: Connection pooling (pgBouncer)
3. **Cache**: Redis para status frequentes
4. **Monitoramento**: Prometheus + Grafana

### Otimizações

- **Batch updates**: Enviar múltiplos status de uma vez
- **Compressão**: Habilitar gzip nas APIs
- **Rate limiting**: Evitar sobrecarga
- **Queue**: RabbitMQ para processamento assíncrono

## 🔄 Manutenção

### Atualização de Agentes

```bash
# Script de atualização
#!/bin/bash
for client in "${CLIENTS[@]}"; do
  scp client_monitor.py root@$client:/opt/alert-monitor/
  ssh root@$client "systemctl restart alert-monitor"
done
```

### Backup de Dados

```bash
# Backup diário
pg_dump alerts_db > backup_$(date +%Y%m%d).sql

# Restauração
psql alerts_db < backup_20250101.sql
```

### Monitoramento do Sistema

- 📊 **Uptime**: 99.9% SLA
- ⚡ **Latência**: < 500ms para APIs
- 📈 **Escalabilidade**: Até 1000+ clientes
- 🔒 **Segurança**: Tokens rotativos

## 📞 Suporte

### Canais de Suporte

- 📧 **Email**: suporte@suaempresa.com
- 📱 **WhatsApp**: (11) 99999-9999
- 🌐 **Documentação**: https://docs.suaempresa.com
- 💬 **Discord/Slack**: Para equipe interna

### Checklist de Verificação

- [ ] Servidor central rodando
- [ ] Banco de dados configurado
- [ ] Tokens de API gerados
- [ ] Agentes instalados nos clientes
- [ ] Comunicação Socket.IO funcionando
- [ ] Notificações configuradas
- [ ] Logs sendo coletados
- [ ] Backup automático ativo

---

**Versão:** 2.0.0  
**Última atualização:** Outubro 2025  
**Compatibilidade:** Python 3.8+, Node.js 18+, PostgreSQL 12+