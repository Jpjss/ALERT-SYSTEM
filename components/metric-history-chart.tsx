'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart, Loader2 } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MetricHistoryChartProps {
  clientId: string;
}

interface MetricData {
  time: string;
  cpu_usage: number;
  memory_usage: number;
}

export function MetricHistoryChart({ clientId }: MetricHistoryChartProps) {
  const [data, setData] = useState<MetricData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (data) { // Esconde o gráfico se ele já estiver visível
      setData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/metrics/history/${clientId}?hours=6`);
      if (!response.ok) {
        throw new Error('Falha ao buscar histórico');
      }
      const historyData: MetricData[] = await response.json();
      if (historyData.length === 0) {
        throw new Error('Nenhum dado de histórico encontrado para este período.');
      }
      setData(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t w-[300px]">
      <Button onClick={fetchHistory} variant="outline" size="sm" className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BarChart className="mr-2 h-4 w-4" />
        )}
        {data ? 'Esconder Histórico' : 'Ver Histórico (6h)'}
      </Button>

      {error && !isLoading && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

      {data && (
        <div className="mt-4 h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis dataKey="time" style={{ fontSize: '10px' }} tickCount={6} />
              <YAxis domain={[0, 100]} unit="%" style={{ fontSize: '10px' }} />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dot" />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="cpu_usage"
                stroke="var(--color-cpu, #16a34a)"
                strokeWidth={2}
                dot={false}
                name="CPU"
              />
              <Line
                type="monotone"
                dataKey="memory_usage"
                stroke="var(--color-memory, #2563eb)"
                strokeWidth={2}
                dot={false}
                name="Memória"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
