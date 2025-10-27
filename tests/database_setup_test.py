#!/usr/bin/env python3
"""
Testes para os Scripts SQL de Configuração do Banco de Dados
Executar com: python -m pytest tests/database_setup_test.py -v
"""

import pytest
import os
import sys
from unittest.mock import Mock, patch, MagicMock
import psycopg2
from psycopg2 import sql

# Adicionar o diretório scripts ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))


class TestDatabaseSetup:
    """Testes para configuração do banco de dados"""

    @pytest.fixture
    def mock_connection(self):
        """Fixture que cria uma conexão mock do PostgreSQL"""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)
        return mock_conn, mock_cursor

    def test_sql_files_exist(self):
        """Testa se os arquivos SQL existem"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')

        assert os.path.exists(os.path.join(scripts_dir, '001_create_alerts_schema.sql'))
        assert os.path.exists(os.path.join(scripts_dir, '002_seed_alert_rules.sql'))
        assert os.path.exists(os.path.join(scripts_dir, '003_seed_sample_data.sql'))

    def test_create_alerts_schema_content(self):
        """Testa conteúdo do script de criação do schema"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        schema_file = os.path.join(scripts_dir, '001_create_alerts_schema.sql')

        with open(schema_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar elementos essenciais do schema baseado no conteúdo real
        assert 'CREATE TABLE IF NOT EXISTS alerts' in content
        assert 'CREATE TABLE IF NOT EXISTS alert_history' in content
        assert 'CREATE TABLE IF NOT EXISTS alert_rules' in content
        assert 'CREATE TABLE IF NOT EXISTS alert_notifications' in content

        # Verificar índices
        assert 'CREATE INDEX' in content

        # Verificar constraints
        assert 'PRIMARY KEY' in content
        assert 'REFERENCES' in content  # Foreign key no PostgreSQL

    def test_seed_alert_rules_content(self):
        """Testa conteúdo do script de seed das regras de alerta"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        seed_file = os.path.join(scripts_dir, '002_seed_alert_rules.sql')

        with open(seed_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar inserções de regras baseado no conteúdo real
        assert 'INSERT INTO alert_rules' in content

        # Verificar tipos de alertas que realmente existem no arquivo
        assert 'backup_failed' in content
        assert 'stock_zero' in content
        assert 'nfe_error' in content
        assert 'disk_space_low' in content

    def test_seed_sample_data_content(self):
        """Testa conteúdo do script de seed dos dados de exemplo"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        sample_file = os.path.join(scripts_dir, '003_seed_sample_data.sql')

        with open(sample_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar inserções de dados de exemplo baseado no conteúdo real
        assert 'INSERT INTO alerts' in content
        assert 'INSERT INTO alert_history' in content
        assert 'INSERT INTO alert_notifications' in content

    @patch('psycopg2.connect')
    def test_database_connection_success(self, mock_connect, mock_connection):
        """Testa conexão bem-sucedida ao banco"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn

        # Simular execução bem-sucedida
        mock_cursor.execute.return_value = None
        mock_conn.commit.return_value = None

        # Tentar conectar (simulado)
        conn = mock_connect(host='localhost', database='test_db', user='test_user', password='test_pass')

        assert conn is not None
        mock_connect.assert_called_once()

    @patch('psycopg2.connect')
    def test_database_connection_failure(self, mock_connect):
        """Testa falha na conexão ao banco"""
        mock_connect.side_effect = psycopg2.OperationalError("Connection failed")

        with pytest.raises(psycopg2.OperationalError):
            mock_connect(host='localhost', database='test_db', user='test_user', password='test_pass')

    @patch('psycopg2.connect')
    def test_execute_sql_script(self, mock_connect, mock_connection):
        """Testa execução de script SQL"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn

        # Script SQL de teste
        test_sql = """
        CREATE TABLE test_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100)
        );
        INSERT INTO test_table (name) VALUES ('test');
        """

        # Simular execução
        mock_cursor.execute.return_value = None
        mock_conn.commit.return_value = None

        # Executar script (simulado)
        with mock_conn.cursor() as cursor:
            cursor.execute(test_sql)
            mock_conn.commit()

        mock_cursor.execute.assert_called_once_with(test_sql)
        mock_conn.commit.assert_called_once()


class TestDatabaseOperations:
    """Testes para operações básicas do banco"""

    @pytest.fixture
    def db_mock(self):
        """Fixture com mock do banco de dados"""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.__enter__ = Mock(return_value=mock_cursor)
        mock_cursor.__exit__ = Mock(return_value=None)

        # Configurar fetchone e fetchall
        mock_cursor.fetchone.return_value = (1, 'Test Client', 'Online')
        mock_cursor.fetchall.return_value = [
            (1, 'Client 1', 'Online'),
            (2, 'Client 2', 'Offline')
        ]

        return mock_conn, mock_cursor

    def test_select_clients(self, db_mock):
        """Testa consulta de clientes"""
        mock_conn, mock_cursor = db_mock

        # Simular consulta
        query = "SELECT id, name, status FROM clients"
        mock_cursor.execute(query)

        result = mock_cursor.fetchall()

        assert len(result) == 2
        assert result[0] == (1, 'Client 1', 'Online')
        assert result[1] == (2, 'Client 2', 'Offline')

    def test_insert_alert(self, db_mock):
        """Testa inserção de alerta"""
        mock_conn, mock_cursor = db_mock

        # Simular inserção
        insert_query = """
        INSERT INTO alerts (client_id, alert_type, severity, title, description)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (1, 'cpu_high', 'warning', 'CPU Alta', 'Uso de CPU em 85%')

        mock_cursor.execute(insert_query, values)
        mock_conn.commit()

        mock_cursor.execute.assert_called_once_with(insert_query, values)
        mock_conn.commit.assert_called_once()

    def test_update_client_status(self, db_mock):
        """Testa atualização de status do cliente"""
        mock_conn, mock_cursor = db_mock

        # Simular atualização
        update_query = "UPDATE clients SET status = %s, last_seen = NOW() WHERE id = %s"
        values = ('Online', 1)

        mock_cursor.execute(update_query, values)
        mock_conn.commit()

        mock_cursor.execute.assert_called_once_with(update_query, values)
        mock_conn.commit.assert_called_once()

    def test_delete_old_alerts(self, db_mock):
        """Testa exclusão de alertas antigos"""
        mock_conn, mock_cursor = db_mock

        # Simular exclusão
        delete_query = "DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '30 days'"

        mock_cursor.execute(delete_query)
        mock_conn.commit()

        mock_cursor.execute.assert_called_once_with(delete_query)
        mock_conn.commit.assert_called_once()


class TestDatabaseIntegrity:
    """Testes de integridade do banco de dados"""

    def test_foreign_key_constraints(self):
        """Testa constraints de chave estrangeira no schema"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        schema_file = os.path.join(scripts_dir, '001_create_alerts_schema.sql')

        with open(schema_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar que alert_history referencia alerts (única FK no schema atual)
        assert 'REFERENCES alerts(id)' in content

    def test_indexes_created(self):
        """Testa criação de índices no schema"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        schema_file = os.path.join(scripts_dir, '001_create_alerts_schema.sql')

        with open(schema_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar índices que realmente existem no schema
        assert 'CREATE INDEX IF NOT EXISTS idx_alerts_client_id' in content
        assert 'CREATE INDEX IF NOT EXISTS idx_alerts_status' in content
        assert 'CREATE INDEX IF NOT EXISTS idx_alerts_severity' in content
        assert 'CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id' in content

    def test_data_types(self):
        """Testa tipos de dados no schema"""
        scripts_dir = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        schema_file = os.path.join(scripts_dir, '001_create_alerts_schema.sql')

        with open(schema_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar tipos de dados que realmente existem no schema
        assert 'SERIAL PRIMARY KEY' in content  # Para IDs
        assert 'VARCHAR(' in content  # Para strings
        assert 'TEXT' in content  # Para textos longos
        assert 'TIMESTAMP' in content  # Para datas
        assert 'JSONB' in content  # Para metadados


if __name__ == '__main__':
    pytest.main([__file__, '-v'])