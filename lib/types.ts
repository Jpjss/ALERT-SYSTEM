export interface Alert {
  id: number
  client_id: string
  client_name: string
  alert_type: string
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "ignored"
  created_at: string
  updated_at?: string
  assigned_to?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
  source?: string
  metadata?: Record<string, any>
}

export interface Client {
  id: string
  name: string
  latitude: number
  longitude: number
  status: "online" | "offline" | "warning"
  last_updated: string
  metadata?: Record<string, any>
}

export interface Metric {
  client_id: string
  cpu_usage: number
  memory_usage: number
  disk_usage?: number
  created_at: string
}
