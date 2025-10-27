import pytest
from unittest.mock import MagicMock, patch

# Para que o teste funcione, precisamos garantir que o client_monitor possa ser importado.
# Adicionamos o diretório 'scripts' ao path para que o Python o encontre.
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock os.getenv para controlar as variáveis de ambiente nos testes
@pytest.fixture(autouse=True)
def mock_settings(mocker):
    # O patch precisa ser feito no módulo onde a função é usada.
    mocker.patch('client_monitor.os.getenv', side_effect=lambda key, default=None: {
        "CLIENT_ID": "test-client-001",
        "CLIENT_NAME": "Test Client",
        "LATITUDE": "-23.5505",
        "LONGITUDE": "-46.6333",
        "API_URL": "http://fakeapi.com",
        "API_TOKEN": "fake-token",
        "CHECK_INTERVAL": "120"
    }.get(key, default))

# Importa o módulo DEPOIS de mocar as dependências
import client_monitor

@pytest.fixture
def monitor():
    """Cria uma instância do ServerMonitor para os testes."""
    # Recarrega o módulo para garantir que os mocks de getenv sejam aplicados
    # durante a inicialização das variáveis globais.
    import importlib
    importlib.reload(client_monitor)
    return client_monitor.ServerMonitor()

def test_determinar_status_online(monitor):
    """Testa se o status é 'Online' quando há internet e as métricas estão normais."""
    metricas_normais = {'cpu_usage': 50, 'memory_usage': 50, 'disk_usage': 50}
    status = monitor.determinar_status(tem_internet=True, metricas=metricas_normais)
    assert status == "Online"

def test_determinar_status_sem_internet(monitor):
    """Testa se o status é 'Sem Internet' quando não há conexão."""
    metricas_normais = {'cpu_usage': 50, 'memory_usage': 50, 'disk_usage': 50}
    status = monitor.determinar_status(tem_internet=False, metricas=metricas_normais)
    assert status == "Sem Internet"

@pytest.mark.parametrize("metrica_critica, valor, status_esperado", [
    ("cpu_usage", 95, "Alerta - CPU Alta"),
    ("memory_usage", 95, "Alerta - Memória Alta"),
    ("disk_usage", 95, "Alerta - Disco Cheio"),
])
def test_determinar_status_alerta_recursos(monitor, metrica_critica, valor, status_esperado):
    """Testa se o status de alerta é acionado para cada métrica crítica."""
    metricas = {'cpu_usage': 10, 'memory_usage': 10, 'disk_usage': 10}
    metricas[metrica_critica] = valor
    status = monitor.determinar_status(tem_internet=True, metricas=metricas)
    assert status == status_esperado

def test_enviar_status_payload_e_endpoint(mocker, monitor):
    """
    Testa se a função enviar_status monta o payload corretamente e chama o endpoint certo.
    """
    # Mock da chamada de rede 'requests.post'
    mock_post = mocker.patch('client_monitor.requests.post')
    
    status_teste = "Online"
    metricas_teste = {'cpu_usage': 25, 'memory_usage': 50, 'disk_usage': 30}
    
    monitor.enviar_status(status_teste, metricas_teste)
    
    # Verifica se requests.post foi chamado uma vez
    mock_post.assert_called_once()
    
    # Extrai os argumentos com os quais a função foi chamada
    call_args, call_kwargs = mock_post.call_args
    
    # Verifica o endpoint
    expected_url = "http://fakeapi.com/api/status/update"
    assert call_args[0] == expected_url
    
    # Verifica o payload (json)
    payload = call_kwargs.get('json', {})
    assert payload['client_id'] == "test-client-001"
    assert payload['client_name'] == "Test Client"
    assert payload['latitude'] == "-23.5505"
    assert payload['longitude'] == "-46.6333"
    assert payload['status'] == status_teste
    assert 'timestamp' in payload
    assert payload['metrics'] == metricas_teste
    
    # Verifica os headers
    headers = call_kwargs.get('headers', {})
    assert headers['Authorization'] == 'Bearer fake-token'
