"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Alert {
  id: number
  client_name: string
  alert_type: string
  status: string
  created_at: string
}

const statusMap: {
  [key: string]: { label: string; className: string }
} = {
  open: {
    label: "Critical",
    className: "bg-error/10 text-error border-error/20",
  },
  in_progress: {
    label: "Unresolved",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-success/10 text-success border-success/20",
  },
  ignored: {
    label: "Ignored",
    className: "bg-muted text-muted-foreground border-muted/20",
  },
}

export function AlertsTable() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts")
        if (!response.ok) {
          throw new Error("Failed to fetch alerts")
        }
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Could not load alerts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusDisplay = (status: string) => {
    return statusMap[status.toLowerCase()] || statusMap.ignored
  }

  if (loading) {
    return (
      <Card className="p-8 bg-card border border-border flex items-center justify-center min-h-[200px]">
        <Spinner className="w-8 h-8" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 bg-card border border-border flex items-center justify-center min-h-[200px]">
        <p className="text-error">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                  No recent alerts found.
                </td>
              </tr>
            ) : (
              alerts.slice(0, 5).map((alert) => {
                const statusDisplay = getStatusDisplay(alert.status)
                return (
                  <tr key={alert.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{alert.client_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{alert.alert_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={statusDisplay.className}>
                        {statusDisplay.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
