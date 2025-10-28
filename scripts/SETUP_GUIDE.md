# 📊 Monitor de Alertas - Guia de Configuração

## ✅ Status da Configuração

### Local (Windows)
- ✅ PostgreSQL 18 instalado e rodando
- ✅ Banco `alert_system` criado
- ✅ Usuário `alert_user` configurado
- ✅ Tabelas criadas (alerts, clients, metrics_history, alert_rules, client_status)
- ✅ Dados de exemplo carregados
- ✅ Dependências Python instaladas (psycopg2-binary, requests, python-dotenv)

### Azure (Servidor de Teste)
- ✅ PostgreSQL 14 rodando
- ✅ Banco configurado e populado
- ✅ Aplicação Next.js online (172.210.162.250:3000)
- ✅ PM2 gerenciando processo

## 🚀 Como Usar o Monitor

### 1. Iniciar Servidor Local

```powershell
cd "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM"
pnpm run dev
```

Aguarde até ver:
```
> Ready on http://localhost:3000
> Socket.IO server initialized
```

### 2. Testar Envio de Alertas

Em outro terminal PowerShell:

```powershell
cd "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM\scripts"
python test_api.py
```

Você verá:
```
✅ Sucesso! - para API local
✅ Sucesso! - para API Azure
```

### 3. Executar Monitor

```powershell
cd "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM\scripts"
python monitor.py
```

O monitor irá:
1. Conectar ao banco PostgreSQL local
2. Verificar condições de alerta
3. Criar alertas no banco
4. Enviar para API local e Azure
5. Registrar notificações

## 📁 Arquivos Importantes

### scripts/.env
Configurações do monitor:
```env
DB_HOST=localhost
DB_NAME=alert_system
DB_USER=alert_user
DB_PASSWORD=alert_secure_pass_2024
LOCAL_API_URL=http://localhost:3000
AZURE_API_URL=http://172.210.162.250:3000
```

### scripts/monitor.py
Script principal de monitoramento

### scripts/test_api.py
Script de teste para enviar alertas

## 🔄 Agendar Execução Automática

### Windows Task Scheduler

```powershell
# Criar tarefa para executar a cada 15 minutos
$action = New-ScheduledTaskAction `
    -Execute "python" `
    -Argument "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM\scripts\monitor.py" `
    -WorkingDirectory "C:\Users\N1\Desktop\projeto teste\ALERT SYSTEM\scripts"

$trigger = New-ScheduledTaskTrigger `
    -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 15)

Register-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -TaskName "AlertSystemMonitor" `
    -Description "Monitora sistemas dos clientes e gera alertas"
```

## 📊 Tipos de Alertas

O monitor detecta automaticamente:

- **backup_failed**: Falhas em backups
- **stock_zero**: Produtos sem estoque
- **nfe_error**: Erros em NF-e
- **db_connection_error**: Problemas de conexão
- **high_error_rate**: Taxa elevada de erros

## 🌐 URLs de Acesso

- **Local**: http://localhost:3000
- **Azure**: http://172.210.162.250:3000

## 🛠️ Troubleshooting

### Servidor não inicia
```powershell
# Verificar porta 3000
netstat -ano | findstr :3000

# Matar processo se necessário
taskkill /PID <PID> /F
```

### Erro de conexão PostgreSQL
```powershell
# Verificar serviço
Get-Service postgresql-x64-18

# Iniciar se parado
Start-Service postgresql-x64-18
```

### Pacotes Python faltando
```powershell
pip install psycopg2-binary requests python-dotenv
```

## 📝 Próximos Passos

1. ✅ Configuração completa
2. 🔄 Testar fluxo end-to-end
3. 📅 Agendar execução automática
4. 📧 Configurar notificações por email (opcional)
5. 📱 Integrar WhatsApp API (opcional)

---

**Tudo está pronto para uso!** 🎉
