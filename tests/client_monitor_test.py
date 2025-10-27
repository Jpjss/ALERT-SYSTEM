import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import socket
import time
from datetime import datetime

# Adicionar o diretório scripts ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))

# Configurar variáveis de ambiente antes de importar
os.environ['CLIENT_ID'] = 'test-client-001'
os.environ['CLIENT_NAME'] = 'Test Client'
os.environ['API_URL'] = 'http://fakeapi.com'
os.environ['API_TOKEN'] = 'test_token_123'
os.environ['CHECK_INTERVAL'] = '60'
os.environ['LATITUDE'] = '-23.5505'
os.environ['LONGITUDE'] = '-46.6333'

from client_monitor import ServerMonitor


class TestServerMonitor:
    """Testes para a classe ServerMonitor"""

    @pytest.fixture
    def monitor(self):
        """Fixture que cria uma instância do ServerMonitor"""
        with patch.dict(os.environ, {
            'CLIENT_ID': 'test-client-001',
            'CLIENT_NAME': 'Test Client',
            'API_URL': 'http://fakeapi.com',
            'API_TOKEN': 'test_token_123',
            'CHECK_INTERVAL': '60',
            'LATITUDE': '-23.5505',
            'LONGITUDE': '-46.6333'
        }):
            return ServerMonitor()

    def test_init(self, monitor):
        """Testa inicialização do monitor"""
        assert monitor.client_id == 'test-client-001'
        assert monitor.client_name == 'Test Client'
        assert monitor.api_url == 'http://fakeapi.com'
        assert monitor.latitude == '-23.5505'
        assert monitor.longitude == '-46.6333'

    @patch('socket.create_connection')
    def test_verificar_internet_conectado(self, mock_socket, monitor):
        """Testa verificação de internet quando conectado"""
        mock_socket.return_value = True
        result = monitor.verificar_internet()
        assert result is True
        assert mock_socket.call_count >= 1

    @patch('socket.create_connection')
    def test_verificar_internet_desconectado(self, mock_socket, monitor):
        """Testa verificação de internet quando desconectado"""
        mock_socket.side_effect = OSError("Connection failed")
        result = monitor.verificar_internet()
        assert result is False

    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    @patch('psutil.pids')
    @patch('psutil.boot_time')
    def test_verificar_servicos(self, mock_boot_time, mock_pids, mock_disk, mock_memory, mock_cpu, monitor):
        """Testa coleta de métricas do sistema"""
        # Configurar mocks
        mock_cpu.return_value = 45.5
        mock_memory.return_value = Mock(percent=67.8)
        mock_disk.return_value = Mock(percent=23.4)
        mock_pids.return_value = [1, 2, 3, 4, 5]
        mock_boot_time.return_value = time.time() - 3600  # 1 hora atrás

        result = monitor.verificar_servicos()

        assert result['cpu_usage'] == 45.5
        assert result['memory_usage'] == 67.8
        assert result['disk_usage'] == 23.4
        assert result['process_count'] == 5
        assert 'uptime' in result

    def test_determinar_status_online(self, monitor):
        """Testa determinação de status Online"""
        tem_internet = True
        metricas = {
            'cpu_usage': 30.0,
            'memory_usage': 40.0,
            'disk_usage': 50.0
        }

        result = monitor.determinar_status(tem_internet, metricas)
        assert result == 'Online'

    def test_determinar_status_alerta_cpu(self, monitor):
        """Testa determinação de status Alerta por CPU alta"""
        tem_internet = True
        metricas = {
            'cpu_usage': 95.0,
            'memory_usage': 40.0,
            'disk_usage': 50.0
        }

        result = monitor.determinar_status(tem_internet, metricas)
        assert result == 'Alerta - CPU Alta'

    def test_determinar_status_sem_internet(self, monitor):
        """Testa determinação de status Sem Internet"""
        tem_internet = False
        metricas = {}

        result = monitor.determinar_status(tem_internet, metricas)
        assert result == 'Sem Internet'

    @patch('requests.post')
    def test_enviar_status_sucesso(self, mock_post, monitor):
        """Testa envio de status com sucesso"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        result = monitor.enviar_status('Online')
        assert result is True
        mock_post.assert_called_once()

    @patch('requests.post')
    def test_enviar_status_falha(self, mock_post, monitor):
        """Testa envio de status com falha"""
        mock_post.side_effect = Exception("Connection error")

        result = monitor.enviar_status('Offline')
        assert result is False

    @patch('requests.post')
    def test_criar_alerta_critico(self, mock_post, monitor):
        """Testa criação de alerta crítico"""
        mock_response = Mock()
        mock_response.status_code = 201
        mock_post.return_value = mock_response

        result = monitor.criar_alerta_critico('disk_space_low', 'Disco cheio')
        assert result is True

        # Verificar payload enviado
        call_args = mock_post.call_args
        payload = call_args[1]['json']

        assert payload['alert_type'] == 'disk_space_low'
        assert payload['severity'] == 'critical'
        assert payload['title'] == 'Alerta Crítico - disk_space_low'
        assert payload['description'] == 'Disco cheio'


class TestIntegration:
    """Testes de integração"""

    @pytest.fixture
    def monitor(self):
        """Fixture com monitor configurado"""
        with patch.dict(os.environ, {
            'CLIENT_ID': 'test-client-001',
            'CLIENT_NAME': 'Test Client',
            'API_URL': 'http://fakeapi.com',
            'API_TOKEN': 'test_token_123',
            'CHECK_INTERVAL': '1',  # 1 segundo para testes
            'LATITUDE': '-23.5505',
            'LONGITUDE': '-46.6333'
        }):
            return ServerMonitor()

    @patch.object(ServerMonitor, 'verificar_internet')
    @patch.object(ServerMonitor, 'verificar_servicos')
    @patch.object(ServerMonitor, 'enviar_status')
    @patch.object(ServerMonitor, 'criar_alerta_critico')
    def test_executar_verificacao_completa(self, mock_alerta, mock_enviar, mock_servicos, mock_internet, monitor):
        """Testa execução completa de verificação"""
        # Configurar mocks
        mock_internet.return_value = True
        mock_servicos.return_value = {
            'cpu_usage': 25.0,
            'memory_usage': 45.0,
            'disk_usage': 60.0,
            'uptime': 120.5
        }
        mock_enviar.return_value = True

        # Executar verificação
        monitor.executar_verificacao()

        # Verificar chamadas
        mock_internet.assert_called_once()
        mock_servicos.assert_called_once()
        mock_enviar.assert_called_once_with('Online', mock_servicos.return_value)
        mock_alerta.assert_not_called()  # Não deve criar alerta para valores normais

    @patch.object(ServerMonitor, 'verificar_internet')
    @patch.object(ServerMonitor, 'verificar_servicos')
    @patch.object(ServerMonitor, 'enviar_status')
    @patch.object(ServerMonitor, 'criar_alerta_critico')
    def test_executar_verificacao_com_alerta(self, mock_alerta, mock_enviar, mock_servicos, mock_internet, monitor):
        """Testa execução com criação de alerta crítico"""
        # Configurar mocks
        mock_internet.return_value = True
        mock_servicos.return_value = {
            'cpu_usage': 25.0,
            'memory_usage': 45.0,
            'disk_usage': 95.0,  # Disco crítico
            'uptime': 120.5
        }
        mock_enviar.return_value = True

        # Executar verificação
        monitor.executar_verificacao()

        # Verificar que alerta foi criado
        mock_alerta.assert_called_once_with(
            'disk_space_low',
            'Espaço em disco crítico: 95.0% utilizado'
        )


if __name__ == '__main__':
    pytest.main([__file__, '-v'])