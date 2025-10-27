# 📦 Instalação do Monitor nos Servidores dos Clientes

Este guia explica como instalar o monitor de status nos servidores dos seus clientes.

## 🎯 O que faz o Monitor?

O `client_monitor.py` é um script Python que roda nos servidores dos clientes e:

- ✅ Verifica conexão com a internet
- 📊 Monitora CPU, memória e disco
- 🔔 Envia alertas automáticos quando detecta problemas
- 📡 Comunica com sua API central em tempo real
- ⚡ Roda em background como serviço

---

## 🐧 Instalação em Linux (Ubuntu/Debian)

### Opção 1: Instalação Automática (Recomendado)

```bash
# 1. Baixe os arquivos necessários
wget https://seu-servidor.com/scripts/client_monitor.py
wget https://seu-servidor.com/scripts/requirements_client.txt
wget https://seu-servidor.com/scripts/install_client.sh

# 2. Execute o instalador
chmod +x install_client.sh
sudo bash install_client.sh
```

O script irá:
- Instalar Python 3 (se necessário)
- Criar ambiente virtual
- Instalar dependências
- Configurar serviço systemd
- Iniciar o monitor automaticamente

### Opção 2: Instalação Manual

```bash
# 1. Instale Python e pip
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv

# 2. Crie diretório
sudo mkdir -p /opt/alert-monitor
cd /opt/alert-monitor

# 3. Copie os arquivos
sudo cp /caminho/client_monitor.py .
sudo cp /caminho/requirements_client.txt requirements.txt

# 4. Crie ambiente virtual
sudo python3 -m venv venv
source venv/bin/activate

# 5. Instale dependências
pip install -r requirements.txt

# 6. Configure variáveis
sudo nano .env
```

Conteúdo do `.env`:
```env
CLIENT_ID=CLI001
CLIENT_NAME=Nome do Cliente
API_URL=https://seu-dominio.com
API_TOKEN=seu_token_aqui
CHECK_INTERVAL=120
```

```bash
# 7. Configure como serviço
sudo nano /etc/systemd/system/alert-monitor.service
```

Conteúdo do serviço:
```ini
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
```

```bash
# 8. Inicie o serviço
sudo systemctl daemon-reload
sudo systemctl enable alert-monitor
sudo systemctl start alert-monitor

# 9. Verifique status
sudo systemctl status alert-monitor
```

---

## 🪟 Instalação em Windows

### Opção 1: Instalação Automática

```cmd
REM 1. Baixe os arquivos
REM 2. Execute como Administrador
install_client.bat
```

### Opção 2: Instalação Manual

```cmd
REM 1. Instale Python 3.8+ de https://www.python.org/downloads/
REM    Marque "Add Python to PATH"

REM 2. Crie diretório
mkdir C:\AlertMonitor
cd C:\AlertMonitor

REM 3. Copie os arquivos
copy client_monitor.py C:\AlertMonitor\
copy requirements_client.txt C:\AlertMonitor\requirements.txt

REM 4. Crie ambiente virtual
python -m venv venv

REM 5. Ative ambiente e instale dependências
venv\Scripts\activate
pip install -r requirements.txt

REM 6. Configure .env
notepad .env
```

Conteúdo do `.env`:
```env
CLIENT_ID=CLI001
CLIENT_NAME=Nome do Cliente
API_URL=https://seu-dominio.com
API_TOKEN=seu_token_aqui
CHECK_INTERVAL=120
```

```cmd
REM 7. Crie arquivo de execução
notepad run_monitor.bat
```

Conteúdo do `run_monitor.bat`:
```batch
@echo off
cd C:\AlertMonitor
call venv\Scripts\activate
python client_monitor.py
```

```cmd
REM 8. Configure tarefa agendada (como Administrador)
schtasks /create /tn "AlertMonitor" /tr "C:\AlertMonitor\run_monitor.bat" /sc onstart /ru SYSTEM

REM 9. Inicie manualmente
schtasks /run /tn "AlertMonitor"
```

---

## ⚙️ Configuração

### Variáveis do .env

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `CLIENT_ID` | ID único do cliente | `CLI001` |
| `CLIENT_NAME` | Nome do cliente | `Empresa ABC Ltda` |
| `API_URL` | URL da sua API central | `https://alerts.empresa.com` |
| `API_TOKEN` | Token de autenticação | `abc123...` |
| `CHECK_INTERVAL` | Intervalo entre verificações (seg) | `120` |

### Como obter o API_TOKEN?

O token deve ser gerado no seu sistema central. Você pode:

1. Criar endpoint `/api/auth/generate-token`
2. Ou usar um token fixo por cliente
3. Ou implementar OAuth2

---

## 🔍 Verificação e Logs

### Linux

```bash
# Ver status do serviço
sudo systemctl status alert-monitor

# Ver logs em tempo real
sudo journalctl -u alert-monitor -f

# Ver logs recentes
sudo journalctl -u alert-monitor -n 100

# Reiniciar serviço
sudo systemctl restart alert-monitor

# Parar serviço
sudo systemctl stop alert-monitor
```

### Windows

```cmd
REM Ver tarefa agendada
schtasks /query /tn "AlertMonitor" /v

REM Ver processos Python
tasklist | findstr python

REM Parar monitor
taskkill /f /im python.exe

REM Iniciar monitor
schtasks /run /tn "AlertMonitor"
```

---

## 🧪 Teste Manual

Antes de configurar como serviço, teste manualmente:

```bash
# Linux
cd /opt/alert-monitor
source venv/bin/activate
python3 client_monitor.py
```

```cmd
REM Windows
cd C:\AlertMonitor
venv\Scripts\activate
python client_monitor.py
```

Você deve ver:
```
╔════════════════════════════════════════════════════════════╗
║         Monitor de Status do Cliente - Iniciado            ║
╚════════════════════════════════════════════════════════════╝

Cliente: Empresa ABC
ID: CLI001
API: https://alerts.empresa.com
Intervalo: 120 segundos

============================================================
Iniciando verificação - 2025-10-21 10:30:00
Cliente: Empresa ABC (CLI001)
============================================================
Internet: ✓ Conectado
CPU: 15.2%
Memória: 45.8%
Disco: 67.3%
Uptime: 120.5 horas
Status: Online
[✓] Status enviado: Online - 2025-10-21 10:30:02
```

---

## 🚨 Alertas Gerados

O monitor cria alertas automáticos quando detecta:

| Condição | Tipo de Alerta | Severidade |
|----------|----------------|------------|
| Sem internet | `no_internet` | `high` |
| CPU > 90% | `cpu_high` | `medium` |
| Memória > 90% | `memory_high` | `high` |
| Disco > 90% | `disk_space_low` | `critical` |
| Memória > 95% | `memory_critical` | `critical` |

---

## 📦 Distribuição para Múltiplos Clientes

### Método 1: Script de Deploy Remoto

```bash
#!/bin/bash
# deploy_to_clients.sh

CLIENTS=(
    "cliente1.com"
    "cliente2.com"
    "cliente3.com"
)

for client in "${CLIENTS[@]}"; do
    echo "Instalando em $client..."
    scp client_monitor.py root@$client:/tmp/
    scp requirements_client.txt root@$client:/tmp/
    scp install_client.sh root@$client:/tmp/
    ssh root@$client "cd /tmp && bash install_client.sh"
done
```

### Método 2: Ansible Playbook

```yaml
# playbook.yml
- hosts: clients
  become: yes
  tasks:
    - name: Copiar arquivos
      copy:
        src: "{{ item }}"
        dest: /opt/alert-monitor/
      loop:
        - client_monitor.py
        - requirements_client.txt
    
    - name: Executar instalação
      shell: bash /opt/alert-monitor/install_client.sh
```

---

## ❓ Troubleshooting

### Monitor não inicia

```bash
# Verifique permissões
ls -la /opt/alert-monitor/

# Verifique dependências
/opt/alert-monitor/venv/bin/pip list

# Teste manualmente
cd /opt/alert-monitor
source venv/bin/activate
python3 client_monitor.py
```

### Erro de conexão com API

- Verifique se `API_URL` está correto
- Teste conexão: `curl -I https://seu-dominio.com`
- Verifique firewall: `sudo ufw status`
- Verifique `API_TOKEN`

### Logs não aparecem

```bash
# Linux: Verifique journald
sudo journalctl --disk-usage
sudo journalctl --vacuum-time=7d

# Windows: Verifique Event Viewer
eventvwr.msc
```

---

## 🔒 Segurança

- ✅ Mantenha `.env` com permissões restritas (`chmod 600`)
- ✅ Use HTTPS na `API_URL`
- ✅ Rotacione `API_TOKEN` periodicamente
- ✅ Execute como usuário não-root (quando possível)
- ✅ Configure firewall para permitir apenas tráfego necessário

---

## 📞 Suporte

Para problemas ou dúvidas:
- 📧 Email: suporte@suaempresa.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Documentação: https://docs.suaempresa.com

---

**Versão:** 1.0.0  
**Última atualização:** Outubro 2025
