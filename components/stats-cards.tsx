"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, AlertTriangle, LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsState {
  critical: number
  resolved: number
  unresolved: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/alerts/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats({ critical: 0, resolved: 0, unresolved: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const cards: {
    label: string
    value: number | undefined
    icon: LucideIcon
    color: string
    bgColor: string
  }[] = [
    {
      label: "Critical Alerts",
      value: stats?.critical,
      icon: AlertCircle,
      color: "text-error",
      bgColor: "bg-error/10",
    },
    {
      label: "Resolved",
      value: stats?.resolved,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Unresolved",
      value: stats?.unresolved,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 bg-card border border-border">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-6 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{card.value ?? 0}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
