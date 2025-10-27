"""
Monitor de Status do Cliente - Lado Servidor
Este script roda nos servidores dos clientes e envia status para o sistema central
"""

import os
import time
import socket
import requests
import platform
import psutil
from datetime import datetime
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()

# Configurações
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_NAME = os.getenv("CLIENT_NAME")
LATITUDE = os.getenv("LATITUDE")
LONGITUDE = os.getenv("LONGITUDE")
API_URL = os.getenv("API_URL")
API_TOKEN = os.getenv("API_TOKEN")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "120"))  # segundos (padrão: 2 min)

# Endereços para teste de conectividade
PING_TARGETS = ["8.8.8.8", "1.1.1.1"]


class ServerMonitor:
    """Classe para monitoramento do servidor"""
    
    def __init__(self):
        self.client_id = CLIENT_ID
        self.client_name = CLIENT_NAME
        self.latitude = LATITUDE
        self.longitude = LONGITUDE
        self.api_url = API_URL
        self.headers = {
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        }
    
    def verificar_internet(self) -> bool:
        """Verifica se há conexão com a internet"""
        for target in PING_TARGETS:
            try:
                socket.create_connection((target, 53), timeout=3)
                return True
            except OSError:
                continue
        return False
    
    def verificar_servicos(self) -> dict:
        """Verifica status dos serviços do sistema"""
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memória
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disco
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # Processos
            process_count = len(psutil.pids())
            
            return {
                'cpu_usage': cpu_percent,
                'memory_usage': memory_percent,
                'disk_usage': disk_percent,
                'process_count': process_count,
                'uptime': self.get_uptime()
            }
        except Exception as e:
            print(f"[ERROR] Erro ao verificar serviços: {e}")
            return {}
    
    def get_uptime(self) -> float:
        """Retorna o tempo de uptime do sistema em horas"""
        try:
            boot_time = psutil.boot_time()
            uptime_seconds = time.time() - boot_time
            return round(uptime_seconds / 3600, 2)  # Converte para horas
        except:
            return 0
    
    def determinar_status(self, tem_internet: bool, metricas: dict) -> str:
        """Determina o status do servidor baseado nas verificações"""
        if not tem_internet:
            return "Sem Internet"
        
        # Verifica se algum recurso está crítico
        if metricas.get('cpu_usage', 0) > 90:
            return "Alerta - CPU Alta"
        if metricas.get('memory_usage', 0) > 90:
            return "Alerta - Memória Alta"
        if metricas.get('disk_usage', 0) > 90:
            return "Alerta - Disco Cheio"
        
        return "Online"
    
    def enviar_status(self, status: str, metricas: dict = None) -> bool:
        """Envia status para a API central"""
        try:
            payload = {
                'client_id': self.client_id,
                'client_name': self.client_name,
                'latitude': self.latitude,
                'longitude': self.longitude,
                'status': status,
                'timestamp': datetime.now().isoformat(),
                'server_info': {
                    'hostname': platform.node(),
                    'os': f"{platform.system()} {platform.release()}",
                    'python_version': platform.python_version()
                }
            }
            
            # Adiciona métricas se disponíveis
            if metricas:
                payload['metrics'] = metricas
            
            response = requests.post(
                f"{self.api_url}/api/status/update",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print(f"[✓] Status enviado: {status} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                return True
            else:
                print(f"[!] Falha ao enviar status: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"[✗] Erro de conexão com API: {e}")
            return False
        except Exception as e:
            print(f"[✗] Erro ao enviar status: {e}")
            return False
    
    def criar_alerta_critico(self, tipo: str, mensagem: str) -> bool:
        """Cria um alerta crítico no sistema"""
        try:
            payload = {
                'client_id': self.client_id,
                'client_name': self.client_name,
                'alert_type': tipo,
                'severity': 'critical',
                'title': f'Alerta Crítico - {tipo}',
                'description': mensagem,
                'source': 'client_monitor',
                'metadata': {
                    'hostname': platform.node(),
                    'timestamp': datetime.now().isoformat()
                }
            }
            
            response = requests.post(
                f"{self.api_url}/api/alerts",
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print(f"[!] Alerta crítico criado: {tipo}")
                return True
            else:
                print(f"[!] Falha ao criar alerta: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"[✗] Erro ao criar alerta: {e}")
            return False
    
    def executar_verificacao(self):
        """Executa uma rodada completa de verificação"""
        print(f"\n{'='*60}")
        print(f"Iniciando verificação - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Cliente: {self.client_name} ({self.client_id})")
        print(f"{'='*60}")
        
        # Verifica internet
        tem_internet = self.verificar_internet()
        print(f"Internet: {'✓ Conectado' if tem_internet else '✗ Sem conexão'}")
        
        # Coleta métricas do sistema
        metricas = self.verificar_servicos()
        if metricas:
            print(f"CPU: {metricas['cpu_usage']}%")
            print(f"Memória: {metricas['memory_usage']}%")
            print(f"Disco: {metricas['disk_usage']}%")
            print(f"Uptime: {metricas['uptime']} horas")
        
        # Determina status geral
        status = self.determinar_status(tem_internet, metricas)
        print(f"Status: {status}")
        
        # Envia para API
        self.enviar_status(status, metricas)
        
        # Cria alertas críticos se necessário
        if metricas:
            if metricas.get('disk_usage', 0) > 90:
                self.criar_alerta_critico(
                    'disk_space_low',
                    f'Espaço em disco crítico: {metricas["disk_usage"]}% utilizado'
                )
            
            if metricas.get('memory_usage', 0) > 95:
                self.criar_alerta_critico(
                    'memory_critical',
                    f'Memória crítica: {metricas["memory_usage"]}% utilizada'
                )


def main():
    """Função principal - loop de monitoramento"""
    
    # Valida configurações
    if not all([CLIENT_ID, CLIENT_NAME, API_URL, API_TOKEN, LATITUDE, LONGITUDE]):
        print("[ERRO] Configurações incompletas no arquivo .env")
        print("Certifique-se de configurar: CLIENT_ID, CLIENT_NAME, API_URL, API_TOKEN, LATITUDE, LONGITUDE")
        return
    
    print(f"""
╔════════════════════════════════════════════════════════════╗
║         Monitor de Status do Cliente - Iniciado            ║
╚════════════════════════════════════════════════════════════╝

Cliente: {CLIENT_NAME}
ID: {CLIENT_ID}
API: {API_URL}
Intervalo: {CHECK_INTERVAL} segundos
Pressione Ctrl+C para parar
    """)
    
    monitor = ServerMonitor()
    
    try:
        while True:
            monitor.executar_verificacao()
            print(f"\nPróxima verificação em {CHECK_INTERVAL} segundos...")
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n[!] Monitor interrompido pelo usuário")
    except Exception as e:
        print(f"\n[ERRO] Erro fatal: {e}")


if __name__ == "__main__":
    main()
