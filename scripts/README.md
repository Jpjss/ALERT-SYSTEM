# Sistema de Monitoramento de Alertas - Python

## Instalação

1. Instale as dependências:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
\`\`\`

3. Execute os scripts SQL para criar o banco:
\`\`\`bash
psql -U postgres -d alerts_db -f 001_create_alerts_schema.sql
psql -U postgres -d alerts_db -f 002_seed_alert_rules.sql
psql -U postgres -d alerts_db -f 003_seed_sample_data.sql
\`\`\`

## Uso Manual

Execute o monitor manualmente:
\`\`\`bash
python3 monitor.py
\`\`\`

## Configuração do Cron

Para executar automaticamente a cada 15 minutos:
\`\`\`bash
chmod +x setup_cron.sh
./setup_cron.sh
\`\`\`

## Tipos de Alertas Monitorados

- **backup_failed**: Falhas em backups automáticos
- **stock_zero**: Produtos com estoque zerado
- **nfe_error**: Erros no envio de NF-e
- **db_connection_error**: Falhas de conexão com banco
- **high_error_rate**: Taxa elevada de erros
- **disk_space_low**: Espaço em disco baixo
- **api_slow**: API com tempo de resposta alto
- **license_expiring**: Licenças próximas do vencimento

## Personalização

Para adicionar novos tipos de monitoramento:

1. Adicione uma nova regra na tabela `alert_rules`
2. Crie um método `check_seu_tipo()` na classe `AlertMonitor`
3. Adicione o método na lista `checks` do método `run_all_checks()`

## Logs

Os logs são salvos em `/var/log/alert_monitor.log`

Para visualizar em tempo real:
\`\`\`bash
tail -f /var/log/alert_monitor.log
