-- Criar tabela de clientes com tokens de API
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    api_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de histórico de métricas (já existe, mas garantindo)
CREATE TABLE IF NOT EXISTS metrics_history (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    cpu_usage DECIMAL(5, 2),
    memory_usage DECIMAL(5, 2),
    disk_usage DECIMAL(5, 2),
    recorded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
);

-- Inserir clientes de exemplo com tokens
INSERT INTO clients (client_id, name, latitude, longitude, api_token) VALUES
('CLI001', 'Tech Solutions SP', -23.5505, -46.6333, 'token_cli001_abc123'),
('CLI002', 'Digital Corp', -23.5489, -46.6388, 'token_cli002_def456'),
('CLI003', 'Cloud Systems', -23.5577, -46.6395, 'token_cli003_ghi789'),
('CLI004', 'Mega Store Sul', -23.6261, -46.6564, 'token_cli004_jkl012'),
('CLI005', 'Shopping Center', -23.6178, -46.6984, 'token_cli005_mno345'),
('CLI006', 'Retail Plus', -23.5986, -46.6898, 'token_cli006_pqr678'),
('CLI007', 'North Tech', -23.4986, -46.6211, 'token_cli007_stu901'),
('CLI008', 'Innovation Hub', -23.5156, -46.6094, 'token_cli008_vwx234'),
('CLI009', 'Smart Business', -23.4798, -46.5436, 'token_cli009_yza567'),
('CLI010', 'East Solutions', -23.5619, -46.4775, 'token_cli010_bcd890'),
('CLI011', 'Logistics Center', -23.5542, -46.5234, 'token_cli011_efg123'),
('CLI012', 'Distribution Hub', -23.5398, -46.4632, 'token_cli012_hij456'),
('CLI013', 'West Commerce', -23.5641, -46.7243, 'token_cli013_klm789'),
('CLI014', 'Business Park', -23.5344, -46.7456, 'token_cli014_nop012'),
('CLI015', 'Corporate Tower', -23.5491, -46.6875, 'token_cli015_qrs345'),
('CLI016', 'Guarulhos Tech', -23.4538, -46.5333, 'token_cli016_tuv678'),
('CLI017', 'ABC Industries', -23.6528, -46.5417, 'token_cli017_wxy901'),
('CLI018', 'Osasco Systems', -23.5329, -46.7919, 'token_cli018_zab234'),
('CLI019', 'Barueri Data Center', -23.5106, -46.8761, 'token_cli019_cde567'),
('CLI020', 'Taboão Tech', -23.6103, -46.7578, 'token_cli020_fgh890'),
('CLI021', 'Porto Alegre Tech', -30.0346, -51.2177, 'token_cli021_ijk123'),
('CLI022', 'Caxias Solutions', -29.1685, -51.1794, 'token_cli022_lmn456'),
('CLI023', 'Pelotas Systems', -31.7719, -52.3425, 'token_cli023_opq789'),
('CLI024', 'Gramado Digital', -29.3742, -50.8764, 'token_cli024_rst012'),
('CLI025', 'Florianópolis Corp', -27.5969, -48.5495, 'token_cli025_uvw345'),
('CLI026', 'Joinville Hub', -26.3044, -48.8464, 'token_cli026_xyz678'),
('CLI027', 'Blumenau Tech', -26.9194, -49.0661, 'token_cli027_abc901'),
('CLI028', 'Chapecó Systems', -27.0964, -52.6183, 'token_cli028_def234'),
('CLI029', 'Curitiba Solutions', -25.4284, -49.2733, 'token_cli029_ghi567'),
('CLI030', 'Londrina Digital', -23.3105, -51.1628, 'token_cli030_jkl890'),
('CLI031', 'Maringá Corp', -23.4253, -51.9382, 'token_cli031_mno123'),
('CLI032', 'Ponta Grossa Hub', -25.0945, -50.1619, 'token_cli032_pqr456')
ON CONFLICT (client_id) DO NOTHING;

-- Atualizar client_status com dados dos clientes
INSERT INTO client_status (client_id, name, latitude, longitude, status)
SELECT client_id, name, latitude, longitude, 'Online'
FROM clients
ON CONFLICT (client_id) DO NOTHING;