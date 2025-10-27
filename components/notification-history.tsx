"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Mail, MessageCircle, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

interface Notification {
  id: number
  alert_id: number
  notification_type: string
  recipient: string
  status: string
  sent_at: string | null
  error_message: string | null
}

interface NotificationHistoryProps {
  alertId?: number
}

export function NotificationHistory({ alertId }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true)
      try {
        const url = alertId ? `/api/notifications/history?alertId=${alertId}` : "/api/notifications/history"
        const response = await fetch(url)
        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("Erro ao buscar notificações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [alertId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma notificação enviada</div>
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const isEmail = notification.notification_type === "email"
        const Icon = isEmail ? Mail : MessageCircle
        const statusIcon =
          notification.status === "sent" ? CheckCircle2 : notification.status === "failed" ? XCircle : Clock

        return (
          <Card key={notification.id} className="p-4 bg-card border-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">{notification.recipient}</p>
                    <p className="text-xs text-muted-foreground">
                      {isEmail ? "Email" : "WhatsApp"} •{" "}
                      {notification.sent_at
                        ? formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true, locale: ptBR })
                        : "Não enviado"}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      notification.status === "sent"
                        ? "bg-success/10 text-success border-success/20"
                        : notification.status === "failed"
                          ? "bg-error/10 text-error border-error/20"
                          : "bg-warning/10 text-warning border-warning/20"
                    }
                  >
                    <statusIcon className="w-3 h-3 mr-1" />
                    {notification.status === "sent"
                      ? "Enviado"
                      : notification.status === "failed"
                        ? "Falhou"
                        : "Pendente"}
                  </Badge>
                </div>

                {notification.error_message && <p className="text-xs text-error mt-2">{notification.error_message}</p>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
