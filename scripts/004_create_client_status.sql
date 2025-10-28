-- Script para criar tabela client_status (status dos clientes em tempo real)

CREATE TABLE IF NOT EXISTS client_status (
    client_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'online',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_client_status_status ON client_status(status);
CREATE INDEX IF NOT EXISTS idx_client_status_updated ON client_status(last_updated);

-- Insere dados de exemplo
INSERT INTO client_status (client_id, name, latitude, longitude, status) VALUES
('CLI001', 'Empresa ABC Ltda', -23.550520, -46.633308, 'online'),
('CLI002', 'Comércio XYZ', -22.906847, -43.172896, 'warning'),
('CLI003', 'Indústria Beta', -25.428954, -49.273251, 'online')
ON CONFLICT (client_id) DO NOTHING;

COMMENT ON TABLE client_status IS 'Status em tempo real dos clientes monitorados';
