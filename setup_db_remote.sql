ALTER USER alert_user WITH PASSWORD 'alert_secure_pass_2024';
GRANT ALL PRIVILEGES ON DATABASE alert_system TO alert_user;
\c alert_system
GRANT ALL ON SCHEMA public TO alert_user;
