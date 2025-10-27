import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from typing import List, Dict, Any, Optional

# Adicionar o diretório scripts ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from monitor import DatabaseConnection, AlertMonitor, NotificationService


class TestDatabaseConnection:
    """Testes para a classe DatabaseConnection"""

    @pytest.fixture
    def db_connection(self):
        """Fixture que cria uma instância do DatabaseConnection"""
        return DatabaseConnection()

    @patch('monitor.psycopg2.connect')
    def test_connect_success(self, mock_connect, db_connection):
        """Testa conexão bem-sucedida com o banco"""
        mock_conn = Mock()
        mock_connect.return_value = mock_conn

        result = db_connection.connect()
        assert result is True
        assert db_connection.conn == mock_conn
        mock_connect.assert_called_once()

    @patch('monitor.psycopg2.connect')
    def test_connect_failure(self, mock_connect, db_connection):
        """Testa falha na conexão com o banco"""
        mock_connect.side_effect = Exception("Connection failed")

        result = db_connection.connect()
        assert result is False
        assert db_connection.conn is None

    def test_close(self, db_connection):
        """Testa fechamento da conexão"""
        mock_conn = Mock()
        mock_cursor = Mock()
        db_connection.conn = mock_conn
        db_connection.cursor = mock_cursor

        db_connection.close()

        mock_cursor.close.assert_called_once()
        mock_conn.close.assert_called_once()
        # O método close não define conn/cursor como None, apenas fecha
        assert db_connection.conn == mock_conn
        assert db_connection.cursor == mock_cursor

    def test_execute_query(self, db_connection):
        """Testa execução de query"""
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [{'id': 1, 'name': 'Test'}]
        db_connection.cursor = mock_cursor

        result = db_connection.execute_query("SELECT * FROM test")

        assert result == [{'id': 1, 'name': 'Test'}]
        mock_cursor.execute.assert_called_once_with("SELECT * FROM test", None)

    @patch('monitor.datetime')
    def test_insert_alert_success(self, mock_datetime, db_connection):
        """Testa inserção bem-sucedida de alerta"""
        mock_cursor = Mock()
        mock_cursor.fetchone.return_value = {'id': 123}
        db_connection.cursor = mock_cursor
        db_connection.conn = Mock()

        mock_datetime.now.return_value = datetime(2025, 10, 23, 16, 39)

        alert_data = {
            'client_id': 'CLI001',
            'client_name': 'Cliente Teste',
            'alert_type': 'backup_failed',
            'severity': 'critical',
            'title': 'Backup Falhou',
            'description': 'Erro no backup',
            'source': 'backup_monitor',
            'metadata': {'error': 'timeout'}
        }

        result = db_connection.insert_alert(alert_data)

        assert result == 123
        assert mock_cursor.execute.called
        db_connection.conn.commit.assert_called_once()

    def test_insert_alert_failure(self, db_connection):
        """Testa falha na inserção de alerta"""
        mock_cursor = Mock()
        mock_cursor.execute.side_effect = Exception("Insert failed")
        db_connection.cursor = mock_cursor
        db_connection.conn = Mock()

        alert_data = {
            'client_id': 'CLI001',
            'client_name': 'Cliente Teste',
            'alert_type': 'backup_failed',
            'severity': 'critical',
            'title': 'Backup Falhou',
            'description': 'Erro no backup',
            'source': 'backup_monitor',
            'metadata': {}
        }

        result = db_connection.insert_alert(alert_data)

        assert result is None
        db_connection.conn.rollback.assert_called_once()

    def test_check_duplicate_alert_true(self, db_connection):
        """Testa verificação de alerta duplicado - encontrado"""
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = [{'id': 1}]
        db_connection.cursor = mock_cursor

        result = db_connection.check_duplicate_alert('CLI001', 'backup_failed', 1)

        assert result is True
        mock_cursor.execute.assert_called_once()

    def test_check_duplicate_alert_false(self, db_connection):
        """Testa verificação de alerta duplicado - não encontrado"""
        mock_cursor = Mock()
        mock_cursor.fetchall.return_value = []
        db_connection.cursor = mock_cursor

        result = db_connection.check_duplicate_alert('CLI001', 'backup_failed', 1)

        assert result is False


class TestAlertMonitor:
    """Testes para a classe AlertMonitor"""

    @pytest.fixture
    def db_mock(self):
        """Mock do DatabaseConnection"""
        return Mock(spec=DatabaseConnection)

    @pytest.fixture
    def alert_monitor(self, db_mock):
        """Fixture que cria uma instância do AlertMonitor"""
        return AlertMonitor(db_mock)

    def test_init(self, db_mock, alert_monitor):
        """Testa inicialização do AlertMonitor"""
        assert alert_monitor.db == db_mock
        assert alert_monitor.alerts_created == []

    def test_get_active_rules(self, db_mock, alert_monitor):
        """Testa obtenção de regras ativas"""
        expected_rules = [
            {'id': 1, 'name': 'Backup Check', 'enabled': True},
            {'id': 2, 'name': 'Stock Check', 'enabled': True}
        ]
        db_mock.execute_query.return_value = expected_rules

        result = alert_monitor.get_active_rules()

        assert result == expected_rules
        db_mock.execute_query.assert_called_once_with("SELECT * FROM alert_rules WHERE enabled = true")

    def test_check_backup_failures(self, db_mock, alert_monitor):
        """Testa verificação de falhas de backup"""
        db_mock.execute_query.return_value = [
            {'client_id': 'CLI001', 'client_name': 'Empresa ABC', 'error_message': 'Timeout na conexão'}
        ]

        result = alert_monitor.check_backup_failures()

        assert len(result) == 1
        alert = result[0]
        assert alert['client_id'] == 'CLI001'
        assert alert['alert_type'] == 'backup_failed'
        assert alert['severity'] == 'critical'

    def test_check_zero_stock(self, db_mock, alert_monitor):
        """Testa verificação de estoque zerado"""
        db_mock.execute_query.return_value = [
            {'client_id': 'CLI002', 'client_name': 'Comércio XYZ', 'product_name': 'Produto A', 'product_id': '12345'}
        ]

        result = alert_monitor.check_zero_stock()

        assert len(result) == 1
        alert = result[0]
        assert alert['client_id'] == 'CLI002'
        assert alert['alert_type'] == 'stock_zero'
        assert alert['severity'] == 'high'

    def test_check_nfe_errors(self, db_mock, alert_monitor):
        """Testa verificação de erros de NF-e"""
        db_mock.execute_query.return_value = [
            {'client_id': 'CLI003', 'client_name': 'Indústria Beta', 'nfe_number': '67890', 'error_msg': 'Certificado expirado'}
        ]

        result = alert_monitor.check_nfe_errors()

        assert len(result) == 1
        alert = result[0]
        assert alert['client_id'] == 'CLI003'
        assert alert['alert_type'] == 'nfe_error'
        assert alert['severity'] == 'critical'

    def test_check_database_connections(self, alert_monitor):
        """Testa verificação de conexões de banco (retorna lista vazia)"""
        result = alert_monitor.check_database_connections()
        assert result == []

    def test_check_high_error_rate(self, alert_monitor):
        """Testa verificação de taxa elevada de erros (retorna lista vazia)"""
        result = alert_monitor.check_high_error_rate()
        assert result == []

    @patch('monitor.print')
    def test_run_all_checks(self, mock_print, db_mock, alert_monitor):
        """Testa execução de todas as verificações"""
        # Configurar mocks para cada check
        db_mock.execute_query.side_effect = [
            [{'client_id': 'CLI001', 'client_name': 'Empresa ABC', 'error_message': 'Timeout'}],  # backup
            [],  # stock
            [],  # nfe
        ]

        result = alert_monitor.run_all_checks()

        assert len(result) == 1  # Apenas backup failure
        assert result[0]['alert_type'] == 'backup_failed'
        assert mock_print.call_count >= 3  # Prints para cada check

    def test_create_alerts_success(self, db_mock, alert_monitor):
        """Testa criação bem-sucedida de alertas"""
        alerts = [
            {
                'client_id': 'CLI001',
                'client_name': 'Empresa ABC',
                'alert_type': 'backup_failed',
                'severity': 'critical',
                'title': 'Backup Falhou',
                'description': 'Erro no backup',
                'source': 'backup_monitor',
                'metadata': {}
            }
        ]

        db_mock.check_duplicate_alert.return_value = False
        db_mock.insert_alert.return_value = 123

        result = alert_monitor.create_alerts(alerts)

        assert result == [123]
        assert len(alert_monitor.alerts_created) == 1
        db_mock.insert_alert.assert_called_once()

    def test_create_alerts_duplicate(self, db_mock, alert_monitor):
        """Testa criação de alertas com duplicata"""
        alerts = [
            {
                'client_id': 'CLI001',
                'client_name': 'Empresa ABC',
                'alert_type': 'backup_failed',
                'severity': 'critical',
                'title': 'Backup Falhou',
                'description': 'Erro no backup',
                'source': 'backup_monitor',
                'metadata': {}
            }
        ]

        db_mock.check_duplicate_alert.return_value = True  # Já existe

        result = alert_monitor.create_alerts(alerts)

        assert result == []
        assert len(alert_monitor.alerts_created) == 0
        db_mock.insert_alert.assert_not_called()


class TestNotificationService:
    """Testes para a classe NotificationService"""

    @pytest.fixture
    def db_mock(self):
        """Mock do DatabaseConnection"""
        return Mock(spec=DatabaseConnection)

    @pytest.fixture
    def notification_service(self, db_mock):
        """Fixture que cria uma instância do NotificationService"""
        return NotificationService(db_mock)

    def test_init(self, db_mock, notification_service):
        """Testa inicialização do NotificationService"""
        assert notification_service.db == db_mock

    @patch('monitor.smtplib.SMTP')
    def test_send_email_success(self, mock_smtp_class, db_mock, notification_service):
        """Testa envio bem-sucedido de email"""
        mock_smtp = Mock()
        mock_smtp_class.return_value.__enter__.return_value = mock_smtp

        result = notification_service.send_email('test@example.com', 'Assunto', 'Corpo')

        assert result is True
        mock_smtp.send_message.assert_called_once()

    @patch('monitor.smtplib.SMTP')
    def test_send_email_failure(self, mock_smtp_class, db_mock, notification_service):
        """Testa falha no envio de email"""
        mock_smtp_class.side_effect = Exception("SMTP Error")

        result = notification_service.send_email('test@example.com', 'Assunto', 'Corpo')

        assert result is False

    @patch('monitor.requests.post')
    @patch('monitor.WHATSAPP_API_URL', 'http://api.example.com')
    @patch('monitor.WHATSAPP_API_TOKEN', 'token123')
    def test_send_whatsapp_success(self, mock_post, db_mock, notification_service):
        """Testa envio bem-sucedido de WhatsApp"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        result = notification_service.send_whatsapp('+5511999999999', 'Mensagem')

        assert result is True
        mock_post.assert_called_once()

    @patch('monitor.requests.post')
    def test_send_whatsapp_no_config(self, mock_post, db_mock, notification_service):
        """Testa envio de WhatsApp sem configuração"""
        result = notification_service.send_whatsapp('+5511999999999', 'Mensagem')

        assert result is False
        mock_post.assert_not_called()

    @patch.object(NotificationService, 'send_email')
    @patch.object(NotificationService, 'log_notification')
    def test_notify_alert_email(self, mock_log, mock_send_email, db_mock, notification_service):
        """Testa notificação por email"""
        mock_send_email.return_value = True

        alert = {
            'id': 123,
            'client_id': 'CLI001',
            'client_name': 'Empresa ABC',
            'alert_type': 'backup_failed',
            'severity': 'critical',
            'title': 'Alerta Crítico',
            'description': 'Descrição do alerta'
        }

        notification_service.notify_alert(alert, ['email'])

        mock_send_email.assert_called_once()
        mock_log.assert_called_once_with(123, 'email', 'suporte@cli001.com', 'sent')

    @patch.object(NotificationService, 'send_whatsapp')
    @patch.object(NotificationService, 'log_notification')
    def test_notify_alert_whatsapp(self, mock_log, mock_send_whatsapp, db_mock, notification_service):
        """Testa notificação por WhatsApp"""
        mock_send_whatsapp.return_value = True

        alert = {
            'id': 456,
            'client_name': 'Empresa XYZ',
            'alert_type': 'disk_space_low',
            'severity': 'high',
            'title': 'Alerta Alto',
            'description': 'Descrição do alerta'
        }

        notification_service.notify_alert(alert, ['whatsapp'])

        mock_send_whatsapp.assert_called_once()
        mock_log.assert_called_once_with(456, 'whatsapp', '+5511999999999', 'sent')

    def test_log_notification(self, db_mock, notification_service):
        """Testa registro de notificação"""
        # Configurar o mock do db com cursor e conn
        mock_cursor = Mock()
        mock_conn = Mock()
        db_mock.cursor = mock_cursor
        db_mock.conn = mock_conn

        notification_service.log_notification(123, 'email', 'test@example.com', 'sent')

        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])