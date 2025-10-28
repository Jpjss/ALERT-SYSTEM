"""
Script de teste para enviar alertas via API
"""
import requests
import json

# Configuração
LOCAL_API = "http://localhost:3000"
AZURE_API = "http://172.210.162.250:3000"

# Alerta de teste
test_alert = {
    "client_id": "CLI004",
    "client_name": "Loja Virtual Gama",
    "alert_type": "high_error_rate",
    "severity": "high",
    "title": "Taxa de Erro Elevada - Teste Python",
    "description": "Detectados 150 erros na última hora na API de pagamentos. Este é um alerta de teste gerado pelo monitor.py",
    "source": "python_monitor",
    "metadata": {
        "error_count": 150,
        "time_window": "1h",
        "endpoint": "/api/payments"
    },
    "status": "open"
}

def send_alert(api_url, alert_data):
    """Envia alerta para API"""
    try:
        response = requests.post(
            f"{api_url}/api/alerts",
            headers={'Content-Type': 'application/json'},
            json=alert_data,
            timeout=10
        )
        
        print(f"\n{'='*60}")
        print(f"Enviando para: {api_url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Sucesso!")
            print(f"Resposta: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Erro: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exceção: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("TESTE DE ENVIO DE ALERTAS VIA API")
    print("="*60)
    
    # Testa API local
    print("\n[1/2] Testando API LOCAL...")
    success_local = send_alert(LOCAL_API, test_alert)
    
    # Testa API Azure
    print("\n[2/2] Testando API AZURE...")
    success_azure = send_alert(AZURE_API, test_alert)
    
    # Resumo
    print("\n" + "="*60)
    print("RESUMO DOS TESTES")
    print("="*60)
    print(f"API Local:  {'✅ OK' if success_local else '❌ FALHOU'}")
    print(f"API Azure:  {'✅ OK' if success_azure else '❌ FALHOU'}")
    print("="*60)
