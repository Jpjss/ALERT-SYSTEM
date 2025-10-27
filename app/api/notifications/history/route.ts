import { type NextRequest, NextResponse } from "next/server"

// Mock data - em produção, buscar do banco de dados
const mockNotifications = [
  {
    id: 1,
    alert_id: 1,
    notification_type: "email",
    recipient: "suporte@empresaabc.com",
    status: "sent",
    sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    error_message: null,
  },
  {
    id: 2,
    alert_id: 1,
    notification_type: "whatsapp",
    recipient: "+5511999999999",
    status: "sent",
    sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    error_message: null,
  },
  {
    id: 3,
    alert_id: 2,
    notification_type: "email",
    recipient: "estoque@comercioxyz.com",
    status: "sent",
    sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    error_message: null,
  },
  {
    id: 4,
    alert_id: 3,
    notification_type: "whatsapp",
    recipient: "+5511888888888",
    status: "failed",
    sent_at: null,
    error_message: "Número inválido ou não registrado no WhatsApp",
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const alertId = searchParams.get("alertId")

  let filtered = [...mockNotifications]

  if (alertId) {
    filtered = filtered.filter((notif) => notif.alert_id === Number.parseInt(alertId))
  }

  return NextResponse.json({
    notifications: filtered,
    total: filtered.length,
  })
}
