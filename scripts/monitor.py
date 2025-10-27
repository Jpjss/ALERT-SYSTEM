"""
Sistema de Monitoramento Automático
Detecta problemas técnicos e operacionais nos sistemas dos clientes
Executa via cron a cada 5-15 minutos
"""

import os
import sys
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

# Configurações do banco de dados
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'alerts_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': os.getenv('DB_PORT', '5432')
}

# Configurações de notificação
EMAIL_CONFIG = {
    'smtp_host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
    'smtp_port': int(os.getenv('SMTP_PORT', '587')),
    'smtp_user': os.getenv('SMTP_USER', ''),
    'smtp_password': os.getenv('SMTP_PASSWORD', ''),
    'from_email': os.getenv('FROM_EMAIL', 'alertas@empresa.com')
}

WHATSAPP_API_URL = os.getenv('WHATSAPP_API_URL', '')
WHATSAPP_API_TOKEN = os.getenv('WHATSAPP_API_TOKEN', '')


class DatabaseConnection:
    """Gerencia conexões com o banco de dados"""
    
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Estabelece conexão com o banco"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            return True
        except Exception as e:
            print(f"[ERROR] Falha ao conectar ao banco: {e}")
            return False
    
    def close(self):
        """Fecha conexão com o banco"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Executa query e retorna resultados"""
        try:
            self.cursor.execute(query, params)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"[ERROR] Erro ao executar query: {e}")
            return []
    
    def insert_alert(self, alert_data: Dict) -> Optional[int]:
        """Insere novo alerta no banco"""
        query = """
            INSERT INTO alerts 
            (client_id, client_name, alert_type, severity, title, description, source, metadata, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        try:
            self.cursor.execute(query, (
                alert_data['client_id'],
                alert_data['client_name'],
                alert_data['alert_type'],
                alert_data['severity'],
                alert_data['title'],
                alert_data['description'],
                alert_data['source'],
                json.dumps(alert_data.get('metadata', {})),
                'open'
            ))
            self.conn.commit()
            result = self.cursor.fetchone()
            return result['id'] if result else None
        except Exception as e:
            print(f"[ERROR] Erro ao inserir alerta: {e}")
            self.conn.rollback()
            return None
    
    def check_duplicate_alert(self, client_id: str, alert_type: str, hours: int = 1) -> bool:
        """Verifica se já existe alerta similar recente"""
        query = """
            SELECT id FROM alerts 
            WHERE client_id = %s 
            AND alert_type = %s 
            AND status IN ('open', 'in_progress')
            AND created_at > NOW() - INTERVAL '%s hours'
            LIMIT 1
        """
        result = self.execute_query(query, (client_id, alert_type, hours))
        return len(result) > 0


class AlertMonitor:
    """Classe principal para monitoramento e geração de alertas"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.alerts_created = []
    
    def get_active_rules(self) -> List[Dict]:
        """Obtém regras de monitoramento ativas"""
        query = "SELECT * FROM alert_rules WHERE enabled = true"
        return self.db.execute_query(query)
    
    def check_backup_failures(self) -> List[Dict]:
        """Detecta falhas em backups (exemplo simulado)"""
        # Em produção, isso consultaria a tabela real de backups
        query = """
            SELECT 'CLI001' as client_id, 'Empresa ABC' as client_name, 
                   'Timeout na conexão' as error_message
            WHERE NOT EXISTS (
                SELECT 1 FROM alerts 
                WHERE client_id = 'CLI001' 
                AND alert_type = 'backup_failed'
                AND status IN ('open', 'in_progress')
                AND created_at > NOW() - INTERVAL '24 hours'
            )
        """
        results = self.db.execute_query(query)
        
        alerts = []
        for row in results:
            alerts.append({
                'client_id': row['client_id'],
                'client_name': row['client_name'],
                'alert_type': 'backup_failed',
                'severity': 'critical',
                'title': 'Falha no Backup Automático',
                'description': f"Backup falhou: {row['error_message']}",
                'source': 'backup_monitor',
                'metadata': {'error': row['error_message']}
            })
        
        return alerts
    
    def check_zero_stock(self) -> List[Dict]:
        """Detecta produtos com estoque zerado"""
        # Simulação - em produção consultaria tabela de inventário real
        query = """
            SELECT 'CLI002' as client_id, 'Comércio XYZ' as client_name,
                   'Produto A' as product_name, '12345' as product_id
            WHERE NOT EXISTS (
                SELECT 1 FROM alerts 
                WHERE client_id = 'CLI002' 
                AND alert_type = 'stock_zero'
                AND metadata->>'product_id' = '12345'
                AND status IN ('open', 'in_progress')
                AND created_at > NOW() - INTERVAL '6 hours'
            )
        """
        results = self.db.execute_query(query)
        
        alerts = []
        for row in results:
            alerts.append({
                'client_id': row['client_id'],
                'client_name': row['client_name'],
                'alert_type': 'stock_zero',
                'severity': 'high',
                'title': f"Estoque Zerado - {row['product_name']}",
                'description': f"O produto '{row['product_name']}' está sem estoque disponível.",
                'source': 'inventory_monitor',
                'metadata': {
                    'product_id': row['product_id'],
                    'product_name': row['product_name']
                }
            })
        
        return alerts
    
    def check_nfe_errors(self) -> List[Dict]:
        """Detecta erros no envio de NF-e"""
        # Simulação - consultaria logs reais de NF-e
        query = """
            SELECT 'CLI003' as client_id, 'Indústria Beta' as client_name,
                   '67890' as nfe_number, 'Certificado expirado' as error_msg
            WHERE NOT EXISTS (
                SELECT 1 FROM alerts 
                WHERE client_id = 'CLI003' 
                AND alert_type = 'nfe_error'
                AND status IN ('open', 'in_progress')
                AND created_at > NOW() - INTERVAL '2 hours'
            )
        """
        results = self.db.execute_query(query)
        
        alerts = []
        for row in results:
            alerts.append({
                'client_id': row['client_id'],
                'client_name': row['client_name'],
                'alert_type': 'nfe_error',
                'severity': 'critical',
                'title': f"Erro no Envio de NF-e #{row['nfe_number']}",
                'description': f"Falha ao enviar NF-e: {row['error_msg']}",
                'source': 'nfe_monitor',
                'metadata': {
                    'nfe_number': row['nfe_number'],
                    'error': row['error_msg']
                }
            })
        
        return alerts
    
    def check_database_connections(self) -> List[Dict]:
        """Detecta falhas de conexão com banco de dados"""
        alerts = []
        # Lógica de verificação de conexões
        return alerts
    
    def check_high_error_rate(self) -> List[Dict]:
        """Detecta taxa elevada de erros"""
        alerts = []
        # Lógica de análise de logs de erro
        return alerts
    
    def run_all_checks(self) -> List[Dict]:
        """Executa todas as verificações de monitoramento"""
        all_alerts = []
        
        print("[INFO] Iniciando verificações de monitoramento...")
        
        # Executa cada tipo de verificação
        checks = [
            ('Backup Failures', self.check_backup_failures),
            ('Zero Stock', self.check_zero_stock),
            ('NF-e Errors', self.check_nfe_errors),
            ('Database Connections', self.check_database_connections),
            ('High Error Rate', self.check_high_error_rate)
        ]
        
        for check_name, check_func in checks:
            try:
                print(f"[INFO] Verificando: {check_name}")
                alerts = check_func()
                all_alerts.extend(alerts)
                print(f"[INFO] {check_name}: {len(alerts)} alertas detectados")
            except Exception as e:
                print(f"[ERROR] Erro em {check_name}: {e}")
        
        return all_alerts
    
    def create_alerts(self, alerts: List[Dict]) -> List[int]:
        """Cria alertas no banco de dados"""
        created_ids = []
        
        for alert in alerts:
            # Verifica duplicatas
            if self.db.check_duplicate_alert(
                alert['client_id'], 
                alert['alert_type']
            ):
                print(f"[SKIP] Alerta duplicado ignorado: {alert['title']}")
                continue
            
            # Insere alerta
            alert_id = self.db.insert_alert(alert)
            if alert_id:
                created_ids.append(alert_id)
                self.alerts_created.append(alert)
                print(f"[SUCCESS] Alerta criado: ID={alert_id}, {alert['title']}")
        
        return created_ids


class NotificationService:
    """Serviço de envio de notificações"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Envia notificação por email"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = EMAIL_CONFIG['from_email']
            msg['To'] = to_email
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2 style="color: #dc2626;">Alerta do Sistema</h2>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                        {body}
                    </div>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                        Este é um alerta automático do sistema de monitoramento.
                    </p>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(html_body, 'html'))
            
            with smtplib.SMTP(EMAIL_CONFIG['smtp_host'], EMAIL_CONFIG['smtp_port']) as server:
                server.starttls()
                server.login(EMAIL_CONFIG['smtp_user'], EMAIL_CONFIG['smtp_password'])
                server.send_message(msg)
            
            print(f"[SUCCESS] Email enviado para {to_email}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Falha ao enviar email: {e}")
            return False
    
    def send_whatsapp(self, phone: str, message: str) -> bool:
        """Envia notificação via WhatsApp API"""
        if not WHATSAPP_API_URL or not WHATSAPP_API_TOKEN:
            print("[WARN] WhatsApp API não configurada")
            return False
        
        try:
            headers = {
                'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'phone': phone,
                'message': message
            }
            
            response = requests.post(
                WHATSAPP_API_URL,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"[SUCCESS] WhatsApp enviado para {phone}")
                return True
            else:
                print(f"[ERROR] Falha no WhatsApp: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"[ERROR] Erro ao enviar WhatsApp: {e}")
            return False
    
    def notify_alert(self, alert: Dict, channels: List[str]) -> None:
        """Envia notificações para os canais especificados"""
        subject = f"[{alert['severity'].upper()}] {alert['title']}"
        body = f"""
            <p><strong>Cliente:</strong> {alert['client_name']}</p>
            <p><strong>Tipo:</strong> {alert['alert_type']}</p>
            <p><strong>Severidade:</strong> {alert['severity']}</p>
            <p><strong>Descrição:</strong></p>
            <p>{alert['description']}</p>
        """
        
        # Email
        if 'email' in channels:
            # Em produção, buscar email do cliente do banco
            recipient = f"suporte@{alert['client_id'].lower()}.com"
            success = self.send_email(recipient, subject, body)
            
            # Registra notificação
            self.log_notification(
                alert.get('id'),
                'email',
                recipient,
                'sent' if success else 'failed'
            )
        
        # WhatsApp
        if 'whatsapp' in channels:
            phone = "+5511999999999"  # Em produção, buscar do banco
            message = f"{subject}\n\n{alert['description']}"
            success = self.send_whatsapp(phone, message)
            
            self.log_notification(
                alert.get('id'),
                'whatsapp',
                phone,
                'sent' if success else 'failed'
            )
    
    def log_notification(self, alert_id: int, notif_type: str, 
                        recipient: str, status: str) -> None:
        """Registra notificação enviada no banco"""
        if not alert_id:
            return
        
        query = """
            INSERT INTO alert_notifications 
            (alert_id, notification_type, recipient, status, sent_at)
            VALUES (%s, %s, %s, %s, %s)
        """
        try:
            self.db.cursor.execute(query, (
                alert_id,
                notif_type,
                recipient,
                status,
                datetime.now() if status == 'sent' else None
            ))
            self.db.conn.commit()
        except Exception as e:
            print(f"[ERROR] Erro ao registrar notificação: {e}")


def main():
    """Função principal do monitor"""
    print("=" * 60)
    print(f"[INFO] Iniciando monitor de alertas - {datetime.now()}")
    print("=" * 60)
    
    # Conecta ao banco
    db = DatabaseConnection()
    if not db.connect():
        print("[ERROR] Não foi possível conectar ao banco de dados")
        sys.exit(1)
    
    try:
        # Inicializa monitor
        monitor = AlertMonitor(db)
        
        # Executa verificações
        detected_alerts = monitor.run_all_checks()
        print(f"\n[INFO] Total de alertas detectados: {len(detected_alerts)}")
        
        # Cria alertas no banco
        created_ids = monitor.create_alerts(detected_alerts)
        print(f"[INFO] Alertas criados no banco: {len(created_ids)}")
        
        # Envia notificações
        if monitor.alerts_created:
            notifier = NotificationService(db)
            
            for alert in monitor.alerts_created:
                # Busca canais de notificação da regra
                channels = ['email']  # Default
                
                print(f"[INFO] Enviando notificações para: {alert['title']}")
                notifier.notify_alert(alert, channels)
        
        print(f"\n[INFO] Monitor finalizado com sucesso")
        
    except Exception as e:
        print(f"[ERROR] Erro durante execução: {e}")
        sys.exit(1)
    
    finally:
        db.close()


if __name__ == "__main__":
    main()
