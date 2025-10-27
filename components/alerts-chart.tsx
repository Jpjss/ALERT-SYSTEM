"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartDataPoint {
  date: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
}

export function AlertsChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/alerts/chart")
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchChartData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-6">Alertas nos Últimos 7 Dias</h2>
        <Skeleton className="h-[280px] w-full" />
      </Card>
    )
  }

  const maxValue = Math.max(...chartData.map(d => d.total), 10)

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Alertas nos Últimos 7 Dias</h2>
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

      <div className="relative h-[280px]">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-border/30" />
          ))}
        </div>

        {/* Chart bars */}
        <div className="relative h-full flex items-end justify-between gap-2 px-2">
          {chartData.map((day, index) => {
            const totalHeight = (day.total / maxValue) * 100
            const criticalPercent = (day.critical / day.total) * 100
            const highPercent = (day.high / day.total) * 100
            const mediumPercent = (day.medium / day.total) * 100
            const lowPercent = (day.low / day.total) * 100

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div
                  className="w-full relative rounded-t transition-all duration-300 hover:opacity-80 group"
                  style={{ height: `${totalHeight}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs whitespace-nowrap">
                      <div className="font-semibold mb-2">{new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Crítico:</span>
                          <span className="font-medium text-red-500">{day.critical}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Alto:</span>
                          <span className="font-medium text-orange-500">{day.high}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Médio:</span>
                          <span className="font-medium text-yellow-500">{day.medium}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Baixo:</span>
                          <span className="font-medium text-blue-500">{day.low}</span>
                        </div>
                        <div className="border-t border-border pt-1 mt-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-semibold">{day.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stacked segments */}
                  <div className="absolute inset-0 flex flex-col-reverse rounded-t overflow-hidden">
                    {day.critical > 0 && (
                      <div className="bg-red-500" style={{ height: `${criticalPercent}%` }} />
                    )}
                    {day.high > 0 && (
                      <div className="bg-orange-500" style={{ height: `${highPercent}%` }} />
                    )}
                    {day.medium > 0 && (
                      <div className="bg-yellow-500" style={{ height: `${mediumPercent}%` }} />
                    )}
                    {day.low > 0 && (
                      <div className="bg-blue-500" style={{ height: `${lowPercent}%` }} />
                    )}
                  </div>
                </div>

                {/* Date label */}
                <div className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
