"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { AlertActionDialog } from "@/components/alert-action-dialog"
import { QuickActionsMenu } from "@/components/quick-actions-menu"

interface Stats {
  critical: number
  resolved: number
  unresolved: number
}

interface Alert {
  id: number
  client_name: string
  client_id?: number
  severity: "critical" | "high" | "medium" | "low"
  title: string
  alert_type?: string
  description?: string
  status: "open" | "in_progress" | "resolved" | "ignored"
  created_at: string
  updated_at?: string
}

interface ChartDataPoint {
  date: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
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

export function IntegratedDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
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
    const fetchAllData = async () => {
      try {
        const [statsRes, alertsRes, chartRes] = await Promise.all([
          fetch("/api/alerts/stats"),
          fetch("/api/alerts"),
          fetch("/api/alerts/chart"),
        ])

        const [statsData, alertsData, chartData] = await Promise.all([
          statsRes.json(),
          alertsRes.json(),
          chartRes.json(),
        ])

        setStats(statsData)
        setAlerts(alertsData.alerts || [])
        setChartData(chartData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const handleStatusChange = (alert: Alert, newStatus: string) => {
    console.log(`Alterando status do alerta ${alert.id} para ${newStatus}`)
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: newStatus as Alert['status'] } : a))
  }

  const handleOpenDialog = (alert: Alert) => {
    setSelectedAlert(alert)
    setDialogOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const [statsRes, alertsRes, chartRes] = await Promise.all([
        fetch("/api/alerts/stats"),
        fetch("/api/alerts"),
        fetch("/api/alerts/chart"),
      ])

      const [statsData, alertsData, chartData] = await Promise.all([
        statsRes.json(),
        alertsRes.json(),
        chartRes.json(),
      ])

      setStats(statsData)
      setAlerts(alertsData.alerts || [])
      setChartData(chartData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const maxValue = Math.max(...chartData.map((d) => d.total), 10)
  const totalAlerts = (stats?.critical || 0) + (stats?.unresolved || 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Críticos Abertos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats?.critical || 0}</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Não Resolvidos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats?.unresolved || 0}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolvidos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats?.resolved || 0}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Ativo</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalAlerts}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Tendência de Alertas (7 dias)</h2>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Baixo</span>
            </div>
          </div>
        </div>

        <div className="relative h-[320px] pl-10">
          {/* Grid Background */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-10 -top-2 text-xs text-muted-foreground w-8 text-right">
                  {Math.round(maxValue - (maxValue / 5) * i)}
                </div>
                <div className="border-t border-border/30 w-full" />
              </div>
            ))}
          </div>

          {/* Chart Canvas */}
          <div className="absolute inset-0 overflow-visible">
            {chartData.map((day, index) => {
              const x = (index / (chartData.length - 1)) * 100
              const nextDay = chartData[index + 1]
              
              const drawLine = (value: number, nextValue: number | undefined, color: string, opacity: string) => {
                if (nextValue === undefined) return null
                
                const y1 = 100 - (value / maxValue) * 100
                const y2 = 100 - (nextValue / maxValue) * 100
                const nextX = ((index + 1) / (chartData.length - 1)) * 100

                return (
                  <div key={`${index}-${color}`} className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line
                        x1={x}
                        y1={y1}
                        x2={nextX}
                        y2={y2}
                        stroke={color}
                        strokeWidth="0.4"
                        opacity={opacity}
                      />
                    </svg>
                  </div>
                )
              }

              return (
                <div key={index}>
                  {nextDay && (
                    <>
                      {drawLine(day.critical, nextDay.critical, "rgb(239, 68, 68)", "0.8")}
                      {drawLine(day.high, nextDay.high, "rgb(249, 115, 22)", "0.8")}
                      {drawLine(day.medium, nextDay.medium, "rgb(234, 179, 8)", "0.8")}
                      {drawLine(day.low, nextDay.low, "rgb(59, 130, 246)", "0.8")}
                    </>
                  )}
                </div>
              )
            })}

            {/* Data Points */}
            {chartData.map((day, index) => {
              const x = (index / (chartData.length - 1)) * 100

              const drawPoint = (value: number, color: string) => {
                const y = 100 - (value / maxValue) * 100
                return (
                  <div
                    className="absolute w-2 h-2 rounded-full -ml-1 -mt-1 transition-all hover:scale-150"
                    style={{
                      backgroundColor: color,
                      left: `${x}%`,
                      top: `${y}%`,
                      boxShadow: `0 0 4px ${color}`,
                    }}
                  />
                )
              }

              return (
                <div key={index}>
                  {day.critical > 0 && drawPoint(day.critical, "rgb(239, 68, 68)")}
                  {day.high > 0 && drawPoint(day.high, "rgb(249, 115, 22)")}
                  {day.medium > 0 && drawPoint(day.medium, "rgb(234, 179, 8)")}
                  {day.low > 0 && drawPoint(day.low, "rgb(59, 130, 246)")}
                </div>
              )
            })}
          </div>

          {/* Interactive Overlay with Tooltips */}
          <div className="absolute inset-0 flex">
            {chartData.map((day, index) => (
              <div key={index} className="flex-1 relative group cursor-pointer">
                {/* Hover Line */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs whitespace-nowrap">
                    <div className="font-semibold mb-2 text-center">
                      {new Date(day.date).toLocaleDateString("pt-BR", { 
                        day: "2-digit", 
                        month: "long",
                        weekday: "short"
                      })}
                    </div>
                    <div className="space-y-1.5">
                      {day.critical > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">Crítico:</span>
                          </div>
                          <span className="font-semibold text-red-500">{day.critical}</span>
                        </div>
                      )}
                      {day.high > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-muted-foreground">Alto:</span>
                          </div>
                          <span className="font-semibold text-orange-500">{day.high}</span>
                        </div>
                      )}
                      {day.medium > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-muted-foreground">Médio:</span>
                          </div>
                          <span className="font-semibold text-yellow-500">{day.medium}</span>
                        </div>
                      )}
                      {day.low > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Baixo:</span>
                          </div>
                          <span className="font-semibold text-blue-500">{day.low}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-1.5 mt-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground font-medium">Total:</span>
                          <span className="font-bold text-foreground">{day.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* X-axis Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                  <div className="font-medium">
                    {new Date(day.date).toLocaleDateString("pt-BR", { day: "2-digit" })}
                  </div>
                  <div className="text-[10px]">
                    {new Date(day.date).toLocaleDateString("pt-BR", { month: "short" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Alerts Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Alertas Recentes</h2>
          <Badge variant="outline" className="text-xs">
            {alerts.length} alertas
          </Badge>
        </div>

        <div className="space-y-3">
          {alerts.slice(0, 8).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-1 h-12 rounded-full ${severityColors[alert.severity]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">{alert.title}</h3>
                    <Badge
                      variant={statusColors[alert.status]}
                      className="text-xs shrink-0"
                    >
                      {alert.status === "open" && "Aberto"}
                      {alert.status === "in_progress" && "Em Progresso"}
                      {alert.status === "resolved" && "Resolvido"}
                      {alert.status === "ignored" && "Ignorado"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.client_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline" className="text-xs capitalize">
                  {alert.severity === "critical" && "Crítico"}
                  {alert.severity === "high" && "Alto"}
                  {alert.severity === "medium" && "Médio"}
                  {alert.severity === "low" && "Baixo"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <QuickActionsMenu
                  alertId={alert.id}
                  onStatusChange={(status) => handleStatusChange(alert, status)}
                  onAssign={() => handleOpenDialog(alert)}
                  onView={() => handleOpenDialog(alert)}
                  onDelete={() => handleUpdate()}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

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
