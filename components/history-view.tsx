"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Calendar, Clock, TrendingUp, TrendingDown } from "lucide-react"

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

const severityLabels = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
}

const severityColors = {
  critical: "text-red-500",
  high: "text-orange-500",
  medium: "text-yellow-500",
  low: "text-blue-500",
}

export function HistoryView() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState<string>("all")
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
        // Busca apenas alertas resolvidos
        const params = new URLSearchParams()
        params.append("status", "resolved")
        if (searchTerm) params.append("search", searchTerm)

        const response = await fetch(`/api/alerts?${params}`)
        const data = await response.json()
        
        let filteredAlerts = data.alerts || []

        // Filtrar por período
        if (periodFilter !== "all") {
          const now = new Date()
          const filterDate = new Date()

          switch (periodFilter) {
            case "today":
              filterDate.setHours(0, 0, 0, 0)
              break
            case "week":
              filterDate.setDate(now.getDate() - 7)
              break
            case "month":
              filterDate.setMonth(now.getMonth() - 1)
              break
          }

          filteredAlerts = filteredAlerts.filter(
            (alert: Alert) => new Date(alert.created_at) >= filterDate
          )
        }

        setAlerts(filteredAlerts)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchAlerts, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, periodFilter])

  // Group alerts by date
  const groupedAlerts = alerts.reduce((groups: { [key: string]: Alert[] }, alert) => {
    const date = new Date(alert.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(alert)
    return groups
  }, {})

  // Calculate stats
  const totalResolved = alerts.length
  const criticalResolved = alerts.filter((a) => a.severity === "critical").length
  const avgResolutionTime = "2.5h" // Mock - would calculate from created_at to updated_at

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Resolvido</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalResolved}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Críticos Resolvidos</p>
              <p className="text-3xl font-bold text-foreground mt-2">{criticalResolved}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
              <p className="text-3xl font-bold text-foreground mt-2">{avgResolutionTime}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o histórico</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedAlerts).length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum histórico encontrado</p>
              <p className="text-sm mt-2">Não há alertas resolvidos no período selecionado</p>
            </div>
          </Card>
        ) : (
          Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">{date}</h3>
                <div className="h-px flex-1 bg-border" />
                <Badge variant="secondary">{dateAlerts.length} alertas</Badge>
              </div>

              <div className="space-y-3 pl-9">
                {dateAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-xs text-muted-foreground min-w-[60px] pt-1">
                        {new Date(alert.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-semibold text-foreground">{alert.title}</h4>
                          <Badge variant="outline" className={severityColors[alert.severity]}>
                            {severityLabels[alert.severity]}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-medium">{alert.client_name}</span>
                          <span>•</span>
                          <span>{alert.client_id}</span>
                          <span>•</span>
                          <span>{alert.alert_type}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
