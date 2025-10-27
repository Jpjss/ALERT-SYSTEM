import { type NextRequest, NextResponse } from "next/server"

// Mock data - in production, this would update the database
const mockAlerts = [
  {
    id: 1,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "backup_failed",
    severity: "critical",
    title: "Falha no Backup Diário",
    description: "O backup automático falhou às 03:00. Erro: Timeout na conexão com o servidor de backup.",
    status: "open",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assigned_to: null,
    resolved_by: null,
    resolved_at: null,
  },
  {
    id: 2,
    client_id: "CLI002",
    client_name: "Comércio XYZ",
    alert_type: "stock_zero",
    severity: "high",
    title: "Estoque Zerado - Produto #1234",
    description: 'O produto "Notebook Dell Inspiron 15" está com estoque zerado.',
    status: "open",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    assigned_to: "João Silva",
    resolved_by: null,
    resolved_at: null,
  },
  {
    id: 3,
    client_id: "CLI003",
    client_name: "Indústria Beta",
    alert_type: "nfe_error",
    severity: "critical",
    title: "Erro no Envio de NF-e #45678",
    description: "Falha ao enviar NF-e para SEFAZ. Erro: Certificado digital expirado.",
    status: "in_progress",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assigned_to: "Maria Santos",
    resolved_by: null,
    resolved_at: null,
  },
  {
    id: 4,
    client_id: "CLI001",
    client_name: "Empresa ABC Ltda",
    alert_type: "db_connection_error",
    severity: "critical",
    title: "Falha na Conexão com Banco de Dados",
    description: "Não foi possível conectar ao banco de dados principal.",
    status: "resolved",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    assigned_to: "Admin",
    resolved_by: "Admin",
    resolved_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    client_id: "CLI004",
    client_name: "Loja Virtual Gama",
    alert_type: "high_error_rate",
    severity: "high",
    title: "Taxa de Erro Elevada na API",
    description: "Detectados 127 erros na última hora na API de pagamentos.",
    status: "open",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    assigned_to: null,
    resolved_by: null,
    resolved_at: null,
  },
]

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertId = Number.parseInt(params.id)
    const body = await request.json()

    // Find the alert
    const alertIndex = mockAlerts.findIndex((a) => a.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    // Update the alert
    const alert = mockAlerts[alertIndex]

    if (body.status !== undefined) {
      alert.status = body.status
      if (body.status === "resolved") {
        alert.resolved_by = "Current User" // In production, get from auth
        alert.resolved_at = new Date().toISOString()
      }
    }

    if (body.assigned_to !== undefined) {
      alert.assigned_to = body.assigned_to
    }

    // In production, update the database here
    console.log("[v0] Alert updated:", { alertId, updates: body })

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertId = Number.parseInt(params.id)

    // Find the alert
    const alertIndex = mockAlerts.findIndex((a) => a.id === alertId)
    if (alertIndex === -1) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
    }

    // Remove the alert
    mockAlerts.splice(alertIndex, 1)

    // In production, delete from database here
    console.log("[v0] Alert deleted:", alertId)

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
