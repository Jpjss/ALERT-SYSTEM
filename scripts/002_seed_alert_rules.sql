-- Insert default monitoring rules
INSERT INTO alert_rules (rule_name, alert_type, severity, check_query, threshold_value, notification_channels) VALUES
('Backup Failure Detection', 'backup_failed', 'critical', 
 'SELECT client_id, client_name FROM backups WHERE status = ''failed'' AND created_at > NOW() - INTERVAL ''24 hours''', 
 NULL, '["email", "whatsapp"]'),

('Zero Stock Alert', 'stock_zero', 'high', 
 'SELECT client_id, client_name, product_name FROM inventory WHERE quantity = 0 AND active = true', 
 0, '["email"]'),

('NF-e Send Error', 'nfe_error', 'critical', 
 'SELECT client_id, client_name, error_message FROM nfe_logs WHERE status = ''error'' AND created_at > NOW() - INTERVAL ''1 hour''', 
 NULL, '["email", "whatsapp"]'),

('Database Connection Failure', 'db_connection_error', 'critical', 
 'SELECT client_id, client_name FROM connection_logs WHERE status = ''failed'' AND created_at > NOW() - INTERVAL ''15 minutes''', 
 NULL, '["email", "whatsapp"]'),

('High Error Rate', 'high_error_rate', 'high', 
 'SELECT client_id, client_name, COUNT(*) as error_count FROM error_logs WHERE created_at > NOW() - INTERVAL ''1 hour'' GROUP BY client_id, client_name HAVING COUNT(*) > 50', 
 50, '["email"]'),

('Disk Space Low', 'disk_space_low', 'medium', 
 'SELECT client_id, client_name, disk_usage_percent FROM system_metrics WHERE disk_usage_percent > 85', 
 85, '["email"]'),

('API Response Time High', 'api_slow', 'medium', 
 'SELECT client_id, client_name, AVG(response_time_ms) as avg_response FROM api_logs WHERE created_at > NOW() - INTERVAL ''30 minutes'' GROUP BY client_id, client_name HAVING AVG(response_time_ms) > 3000', 
 3000, '["email"]'),

('License Expiring Soon', 'license_expiring', 'high', 
 'SELECT client_id, client_name, expiry_date FROM licenses WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL ''7 days''', 
 NULL, '["email"]')
ON CONFLICT (rule_name) DO NOTHING;
