-- Tabela para armazenar o histórico de métricas de recursos dos clientes
CREATE TABLE IF NOT EXISTS metrics_history (
    id BIGSERIAL PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES client_status(client_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    cpu_usage DECIMAL(5, 2),
    memory_usage DECIMAL(5, 2),
    disk_usage DECIMAL(5, 2)
);

-- Índices para otimizar as consultas de séries temporais por cliente
CREATE INDEX IF NOT EXISTS idx_metrics_history_client_id_created_at ON metrics_history(client_id, created_at DESC);

-- Opcional: Para bancos de dados PostgreSQL com a extensão TimescaleDB,
-- você poderia converter esta tabela em uma hypertabela para melhor performance.
-- SELECT create_hypertable('metrics_history', 'created_at', if_not_exists => TRUE);
