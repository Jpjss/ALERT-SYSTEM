"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, Clock, CheckCircle2, ChevronDown, User, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SendNotificationDialog } from "@/components/send-notification-dialog"
import { AlertActionsMenu } from "@/components/alert-actions-menu"

interface AlertCardProps {
  alert: {
    id: number
    client_name: string
    alert_type: string
    severity: "critical" | "high" | "medium" | "low"
    title: string
    description: string
    status: string
    created_at: string
    assigned_to?: string
    resolved_by?: string
    resolved_at?: string
  }
  onAlertUpdated?: () => void
}

const severityConfig = {
  critical: {
    label: "Crítica",
    color: "bg-error/10 text-error border-error/20",
    icon: AlertTriangle,
  },
  high: {
    label: "Alta",
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertTriangle,
  },
  medium: {
    label: "Média",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: Clock,
  },
  low: {
    label: "Baixa",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
}

const statusConfig = {
  open: { label: "Aberto", color: "bg-error/10 text-error" },
  in_progress: { label: "Em Progresso", color: "bg-warning/10 text-warning" },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success" },
  ignored: { label: "Ignorado", color: "bg-muted text-muted-foreground" },
}

export function AlertCard({ alert, onAlertUpdated }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)

  const severity = severityConfig[alert.severity]
  const status = statusConfig[alert.status as keyof typeof statusConfig]
  const SeverityIcon = severity.icon

  const timeAgo = formatDistanceToNow(new Date(alert.created_at), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Severity indicator */}
          <div className={cn("p-2 rounded-lg border", severity.color)}>
            <SeverityIcon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-balance">{alert.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{alert.client_name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={severity.color}>
                  {severity.label}
                </Badge>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{alert.description}</p>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {timeAgo}
              </div>

              {alert.assigned_to && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {alert.assigned_to}
                </div>
              )}
            </div>

            {expanded && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Descrição Completa</p>
                  <p className="text-sm text-foreground">{alert.description}</p>
                </div>

                {alert.resolved_by && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Resolvido por</p>
                    <p className="text-sm text-foreground">
                      {alert.resolved_by} em{" "}
                      {alert.resolved_at &&
                        formatDistanceToNow(new Date(alert.resolved_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button variant="ghost" size="sm" className="text-xs -ml-2" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Ver menos" : "Ver mais"}
                <ChevronDown className={cn("w-3 h-3 ml-1 transition-transform", expanded && "rotate-180")} />
              </Button>

              <div className="flex-1" />

              <SendNotificationDialog alert={alert} />
              <AlertActionsMenu alert={alert} onAlertUpdated={onAlertUpdated} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
