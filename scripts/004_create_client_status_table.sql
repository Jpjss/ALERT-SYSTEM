-- Tabela para armazenar o último status conhecido de cada cliente
CREATE TABLE IF NOT EXISTS client_status (
    client_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_client_status_status ON client_status(status);

-- Função para atualizar o timestamp da coluna last_updated
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Gatilho para auto-atualizar last_updated na tabela client_status
-- Remove o gatilho antigo se existir, para evitar erros na re-execução
DROP TRIGGER IF EXISTS update_client_status_last_updated ON client_status;
CREATE TRIGGER update_client_status_last_updated
BEFORE UPDATE ON client_status
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();
