"use client"

import { useEffect, useState } from "react"
import { AlertCard } from "@/components/alert-card"
import { Spinner } from "@/components/ui/spinner"

interface Alert {
  id: number
  client_id: string
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

interface AlertListProps {
  filters: {
    status: string
    severity: string
    search: string
  }
}

export function AlertList({ filters }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== "all") params.set("status", filters.status)
      if (filters.severity !== "all") params.set("severity", filters.severity)
      if (filters.search) params.set("search", filters.search)

      const response = await fetch(`/api/alerts?${params}`)
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Erro ao buscar alertas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [filters])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">Nenhum alerta encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onAlertUpdated={fetchAlerts} />
      ))}
    </div>
  )
}
