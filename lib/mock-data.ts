// Sistema centralizado de dados mockados
// Em produção, isso viria do banco de dados

export interface Alert {
  id: number
  client_id: string
  client_name: string
  alert_type: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "ignored"
  created_at: string
  updated_at: string
}

// Base de alertas mockados - simula um banco de dados
export const mockAlerts: Alert[] = [
  // Hoje - Alertas recentes
  {
    id: 1,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "backup_failed",
    severity: "critical",
    title: "Falha no Backup Automático",
    description: "Backup falhou: Timeout na conexão",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    client_id: "CLI010",
    client_name: "Escritório Advocacia Silva",
    alert_type: "security_alert",
    severity: "critical",
    title: "Tentativa de Acesso Não Autorizado",
    description: "Múltiplas tentativas de login falhadas detectadas",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    client_id: "CLI007",
    client_name: "Supermercado Bom Preço",
    alert_type: "database_error",
    severity: "critical",
    title: "Erro de Conexão com Banco",
    description: "Falha ao conectar com banco de dados principal",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    client_id: "CLI005",
    client_name: "Restaurante Sabor",
    alert_type: "system_slow",
    severity: "low",
    title: "Sistema com Lentidão",
    description: "Tempo de resposta acima do normal",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    client_id: "CLI003",
    client_name: "Indústria Beta",
    alert_type: "nfe_error",
    severity: "critical",
    title: "Erro no Envio de NF-e",
    description: "Falha ao enviar NF-e: Certificado expirado",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    client_id: "CLI008",
    client_name: "Hotel Vista Mar",
    alert_type: "api_slow",
    severity: "medium",
    title: "API com Lentidão",
    description: "Tempo de resposta médio acima de 3 segundos",
    status: "in_progress",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "disk_space_low",
    severity: "high",
    title: "Espaço em Disco Baixo",
    description: "Servidor com 95% do disco utilizado",
    status: "in_progress",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    client_id: "CLI011",
    client_name: "Loja de Eletrônicos Tech",
    alert_type: "payment_failed",
    severity: "high",
    title: "Falha em Processamento de Pagamento",
    description: "15 transações falharam na última hora",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // Ontem
  {
    id: 9,
    client_id: "CLI002",
    client_name: "Comércio XYZ",
    alert_type: "stock_zero",
    severity: "high",
    title: "Estoque Zerado - Produto A",
    description: "O produto 'Produto A' está sem estoque disponível.",
    status: "in_progress",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    client_id: "CLI009",
    client_name: "Clínica Saúde+",
    alert_type: "backup_failed",
    severity: "high",
    title: "Backup Incompleto",
    description: "Backup completou com 23% dos arquivos faltando",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 11,
    client_id: "CLI004",
    client_name: "Loja Virtual 123",
    alert_type: "payment_error",
    severity: "medium",
    title: "Erro no Gateway de Pagamento",
    description: "Gateway retornou erro 502",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 12,
    client_id: "CLI012",
    client_name: "Padaria Pão Quente",
    alert_type: "pos_offline",
    severity: "critical",
    title: "PDV Offline",
    description: "Terminal de vendas não está respondendo",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 13,
    client_id: "CLI013",
    client_name: "Oficina AutoCar",
    alert_type: "system_error",
    severity: "medium",
    title: "Erro no Sistema de Estoque",
    description: "Inconsistência detectada no inventário",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 14,
    client_id: "CLI014",
    client_name: "Consultório Dr. Mendes",
    alert_type: "appointment_sync_error",
    severity: "low",
    title: "Falha na Sincronização de Agenda",
    description: "Agenda não sincronizou com calendário online",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 2 dias atrás
  {
    id: 15,
    client_id: "CLI006",
    client_name: "Farmácia Central",
    alert_type: "license_expiring",
    severity: "high",
    title: "Licença Próxima do Vencimento",
    description: "Licença vence em 5 dias",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 16,
    client_id: "CLI015",
    client_name: "Academia FitLife",
    alert_type: "access_control_error",
    severity: "medium",
    title: "Erro no Controle de Acesso",
    description: "Catracas não estão registrando entradas",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 17,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "email_delivery_failed",
    severity: "high",
    title: "Falha no Envio de E-mails",
    description: "Servidor SMTP não está respondendo",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 18,
    client_id: "CLI016",
    client_name: "Pet Shop Amigo Fiel",
    alert_type: "stock_low",
    severity: "low",
    title: "Estoque Baixo - Ração Premium",
    description: "Apenas 8 unidades em estoque",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 3 dias atrás
  {
    id: 19,
    client_id: "CLI002",
    client_name: "Comércio XYZ",
    alert_type: "stock_low",
    severity: "medium",
    title: "Estoque Baixo - Produto B",
    description: "Apenas 5 unidades restantes",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 20,
    client_id: "CLI017",
    client_name: "Pizzaria Bella Napoli",
    alert_type: "delivery_tracking_error",
    severity: "medium",
    title: "Erro no Rastreamento de Entregas",
    description: "Sistema de tracking offline",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 21,
    client_id: "CLI018",
    client_name: "Livraria Saber",
    alert_type: "fiscal_printer_error",
    severity: "critical",
    title: "Impressora Fiscal com Erro",
    description: "Não foi possível emitir cupom fiscal",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 22,
    client_id: "CLI019",
    client_name: "Salão de Beleza Glamour",
    alert_type: "schedule_conflict",
    severity: "low",
    title: "Conflito de Agendamento",
    description: "Dois clientes agendados para o mesmo horário",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 4 dias atrás
  {
    id: 23,
    client_id: "CLI007",
    client_name: "Supermercado Bom Preço",
    alert_type: "price_sync_error",
    severity: "high",
    title: "Erro na Sincronização de Preços",
    description: "Preços no sistema não batem com etiquetas",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 24,
    client_id: "CLI020",
    client_name: "Autopeças Veloz",
    alert_type: "integration_error",
    severity: "medium",
    title: "Falha na Integração com Fornecedor",
    description: "API do fornecedor retornou erro 500",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 98).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 25,
    client_id: "CLI003",
    client_name: "Indústria Beta",
    alert_type: "production_halt",
    severity: "critical",
    title: "Parada na Linha de Produção",
    description: "Sensor defeituoso detectado",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 5 dias atrás
  {
    id: 26,
    client_id: "CLI021",
    client_name: "Escola Crescer",
    alert_type: "attendance_system_down",
    severity: "medium",
    title: "Sistema de Presença Offline",
    description: "Não foi possível registrar presença dos alunos",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 27,
    client_id: "CLI022",
    client_name: "Laboratório Análises Precisas",
    alert_type: "equipment_calibration",
    severity: "high",
    title: "Equipamento Precisa de Calibração",
    description: "Resultados fora do padrão esperado",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 122).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 28,
    client_id: "CLI008",
    client_name: "Hotel Vista Mar",
    alert_type: "booking_error",
    severity: "high",
    title: "Erro no Sistema de Reservas",
    description: "Dupla reserva para o mesmo quarto",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 124).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 29,
    client_id: "CLI023",
    client_name: "Transportadora Rápida",
    alert_type: "gps_signal_lost",
    severity: "low",
    title: "Sinal GPS Perdido",
    description: "Veículo #456 sem sinal há 2 horas",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 126).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 6 dias atrás
  {
    id: 30,
    client_id: "CLI004",
    client_name: "Loja Virtual 123",
    alert_type: "checkout_error",
    severity: "critical",
    title: "Erro no Checkout",
    description: "Clientes não conseguem finalizar compras",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 31,
    client_id: "CLI024",
    client_name: "Clínica Veterinária Patinhas",
    alert_type: "database_backup_warning",
    severity: "medium",
    title: "Backup Demorado",
    description: "Backup levou 3x mais tempo que o normal",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 146).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 32,
    client_id: "CLI025",
    client_name: "Mercadinho do Bairro",
    alert_type: "cash_register_error",
    severity: "high",
    title: "Erro na Gaveta do Caixa",
    description: "Gaveta não abre automaticamente",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 148).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 33,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "vpn_connection_failed",
    severity: "medium",
    title: "Falha na VPN",
    description: "Funcionários remotos sem acesso",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 7 dias atrás (semana passada)
  {
    id: 34,
    client_id: "CLI026",
    client_name: "Estúdio de Fotografia Flash",
    alert_type: "storage_full",
    severity: "critical",
    title: "Armazenamento Cheio",
    description: "Servidor de fotos com 98% de uso",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 35,
    client_id: "CLI027",
    client_name: "Ótica Visão Clara",
    alert_type: "prescription_system_error",
    severity: "high",
    title: "Erro no Sistema de Receitas",
    description: "Não foi possível imprimir receita",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 170).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 36,
    client_id: "CLI028",
    client_name: "Lavanderia Express",
    alert_type: "machine_malfunction",
    severity: "medium",
    title: "Máquina com Defeito",
    description: "Máquina #3 não está centrifugando",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 172).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 37,
    client_id: "CLI029",
    client_name: "Construtora Alicerce",
    alert_type: "project_delay_alert",
    severity: "low",
    title: "Atraso no Cronograma",
    description: "Obra #102 está 3 dias atrasada",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 174).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 38,
    client_id: "CLI030",
    client_name: "Imobiliária Prime",
    alert_type: "contract_expiring",
    severity: "medium",
    title: "Contrato Próximo do Vencimento",
    description: "Contrato #789 vence em 7 dias",
    status: "resolved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 176).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Funções auxiliares para estatísticas
export function getAlertStats() {
  const critical = mockAlerts.filter(
    a => a.severity === "critical" && a.status === "open"
  ).length

  const resolved = mockAlerts.filter(
    a => a.status === "resolved"
  ).length

  const unresolved = mockAlerts.filter(
    a => a.status === "open" || a.status === "in_progress"
  ).length

  return { critical, resolved, unresolved }
}

// Função para gerar dados do gráfico dos últimos 7 dias
export function getChartData() {
  const data = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    // Filtra alertas criados neste dia
    const dayAlerts = mockAlerts.filter(alert => {
      const alertDate = new Date(alert.created_at)
      return alertDate >= date && alertDate < nextDate
    })
    
    const critical = dayAlerts.filter(a => a.severity === "critical").length
    const high = dayAlerts.filter(a => a.severity === "high").length
    const medium = dayAlerts.filter(a => a.severity === "medium").length
    const low = dayAlerts.filter(a => a.severity === "low").length
    
    data.push({
      date: date.toISOString().split('T')[0],
      critical,
      high,
      medium,
      low,
      total: critical + high + medium + low
    })
  }
  
  return data
}
