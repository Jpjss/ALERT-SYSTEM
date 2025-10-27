-- Insert sample alerts for testing
INSERT INTO alerts (client_id, client_name, alert_type, severity, title, description, source, metadata, status) VALUES
('CLI001', 'Empresa ABC Ltda', 'backup_failed', 'critical', 
 'Falha no Backup Diário', 
 'O backup automático falhou às 03:00. Erro: Timeout na conexão com o servidor de backup.',
 'backup_monitor', 
 '{"backup_type": "full", "error_code": "TIMEOUT_001", "server": "backup-srv-01"}',
 'open'),

('CLI002', 'Comércio XYZ', 'stock_zero', 'high',
 'Estoque Zerado - Produto #1234',
 'O produto ''Notebook Dell Inspiron 15'' está com estoque zerado.',
 'inventory_monitor',
 '{"product_id": "1234", "product_name": "Notebook Dell Inspiron 15", "last_sale": "2025-10-15 14:30:00"}',
 'open'),

('CLI003', 'Indústria Beta', 'nfe_error', 'critical',
 'Erro no Envio de NF-e #45678',
 'Falha ao enviar NF-e para SEFAZ. Erro: Certificado digital expirado.',
 'nfe_monitor',
 '{"nfe_number": "45678", "error_code": "280", "sefaz_message": "Certificado digital inválido ou expirado"}',
 'in_progress'),

('CLI001', 'Empresa ABC Ltda', 'db_connection_error', 'critical',
 'Falha na Conexão com Banco de Dados',
 'Não foi possível conectar ao banco de dados principal. Sistema pode estar indisponível.',
 'db_monitor',
 '{"database": "production_db", "host": "db-srv-01", "attempts": 5}',
 'resolved'),

('CLI004', 'Loja Virtual Gama', 'high_error_rate', 'high',
 'Taxa de Erro Elevada na API',
 'Detectados 127 erros na última hora na API de pagamentos.',
 'api_monitor',
 '{"error_count": 127, "endpoint": "/api/payments", "period": "1h"}',
 'open');

-- Insert sample alert history
INSERT INTO alert_history (alert_id, action, performed_by, old_status, new_status, notes) VALUES
(3, 'status_change', 'suporte@empresa.com', 'open', 'in_progress', 'Iniciando investigação do problema com certificado digital.'),
(4, 'status_change', 'admin@empresa.com', 'open', 'in_progress', 'Reiniciando serviço de banco de dados.'),
(4, 'status_change', 'admin@empresa.com', 'in_progress', 'resolved', 'Conexão restaurada após reinicialização do serviço.');

-- Insert sample notifications
INSERT INTO alert_notifications (alert_id, notification_type, recipient, status, sent_at) VALUES
(1, 'email', 'suporte@empresaabc.com', 'sent', NOW() - INTERVAL '2 hours'),
(1, 'whatsapp', '+5511999999999', 'sent', NOW() - INTERVAL '2 hours'),
(2, 'email', 'estoque@comercioxyz.com', 'sent', NOW() - INTERVAL '1 hour'),
(3, 'email', 'fiscal@industriabeta.com', 'sent', NOW() - INTERVAL '30 minutes'),
(3, 'whatsapp', '+5511888888888', 'failed', NULL);
