import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

async function getStats() {
  // Em produção, buscar do banco de dados
  return {
    openAlerts: 12,
    inProgress: 5,
    resolvedToday: 23,
    avgResponseTime: "18min",
  }
}

export async function StatsOverview() {
  const stats = await getStats()

  const cards = [
    {
      title: "Alertas Abertos",
      value: stats.openAlerts,
      icon: AlertTriangle,
      color: "text-error",
      bgColor: "bg-error/10",
    },
    {
      title: "Em Progresso",
      value: stats.inProgress,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Resolvidos Hoje",
      value: stats.resolvedToday,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Tempo Médio",
      value: stats.avgResponseTime,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-6 bg-card border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
