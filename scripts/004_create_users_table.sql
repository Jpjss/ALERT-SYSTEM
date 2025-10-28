-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Administrador',
  'admin@alertsystem.com',
  '$2b$10$rFXZPdtntf/.FJkaMuW5o./tTPizVwm0Gj4Y5EiTfenIRF9X.SOgK',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default manager user (password: manager123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Gerente',
  'manager@alertsystem.com',
  '$2b$10$3tlbRmuI07omxSE8NhOsL.lxptM9oz.FElzk1NljKeoAPN4/FcW7O',
  'manager'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default regular user (password: user123)
INSERT INTO users (name, email, password, role)
VALUES (
  'Usuário',
  'user@alertsystem.com',
  '$2b$10$VR5U4G0filFs/gPw3o4nt.jC8MY6RfQC07PUbv6Y2nFp9mqi8rbeG',
  'user'
)
ON CONFLICT (email) DO NOTHING;
