"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, AlertCircle } from "lucide-react"
import { AlertActionDialog } from "@/components/alert-action-dialog"
import { QuickActionsMenu } from "@/components/quick-actions-menu"

interface Alert {
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

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
}

const statusColors = {
  open: "destructive",
  in_progress: "default",
  resolved: "secondary",
  ignored: "outline",
} as const

const statusLabels = {
  open: "Aberto",
  in_progress: "Em Progresso",
  resolved: "Resolvido",
  ignored: "Ignorado",
}

const severityLabels = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
}

export function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30000)

  useEffect(() => {
    // Load refresh interval from settings
    const savedSettings = localStorage.getItem("alertSystemSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.autoRefresh !== false) {
          const interval = parseInt(settings.refreshInterval || "30") * 1000
          setRefreshInterval(interval)
        }
      } catch (e) {
        console.error("Error loading settings:", e)
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      const settings = event.detail
      if (settings.autoRefresh !== false) {
        const interval = parseInt(settings.refreshInterval || "30") * 1000
        setRefreshInterval(interval)
      }
    }

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener)
    return () => window.removeEventListener('settingsChanged', handleSettingsChange as EventListener)
  }, [])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.append("status", statusFilter)
        if (severityFilter !== "all") params.append("severity", severityFilter)
        if (searchTerm) params.append("search", searchTerm)

        const response = await fetch(`/api/alerts?${params}`)
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchAlerts, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, statusFilter, severityFilter])

  const handleStatusChange = (alert: Alert, newStatus: string) => {
    console.log(`Alterando status do alerta ${alert.id} para ${newStatus}`)
    // Simula atualização local
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: newStatus as Alert['status'] } : a))
  }

  const handleOpenDialog = (alert: Alert) => {
    setSelectedAlert(alert)
    setDialogOpen(true)
  }

  const handleUpdate = () => {
    // Recarrega os alertas após atualização
    const fetchAlerts = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.append("status", statusFilter)
        if (severityFilter !== "all") params.append("severity", severityFilter)
        if (searchTerm) params.append("search", searchTerm)

        const response = await fetch(`/api/alerts?${params}`)
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error("Error fetching alerts:", error)
      }
    }
    fetchAlerts()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, cliente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="ignored">Ignorado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Severidades</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum alerta encontrado</p>
              <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
            </div>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-1.5 h-full rounded-full ${severityColors[alert.severity]} self-stretch`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{alert.title}</h3>
                        <Badge variant={statusColors[alert.status]} className="shrink-0">
                          {statusLabels[alert.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    </div>

                    <Badge variant="outline" className="shrink-0">
                      {severityLabels[alert.severity]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Cliente:</span>
                      <span>{alert.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">ID:</span>
                      <span>{alert.client_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipo:</span>
                      <span>{alert.alert_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Criado:</span>
                      <span>
                        {new Date(alert.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <QuickActionsMenu
                  alertId={alert.id}
                  onStatusChange={(status) => handleStatusChange(alert, status)}
                  onAssign={() => handleOpenDialog(alert)}
                  onView={() => handleOpenDialog(alert)}
                  onDelete={() => handleUpdate()}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-muted-foreground">
        Mostrando {alerts.length} {alerts.length === 1 ? "alerta" : "alertas"}
      </div>

      {/* Action Dialog */}
      <AlertActionDialog
        alert={selectedAlert}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
