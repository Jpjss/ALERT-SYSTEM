"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { User, CheckCircle2, Clock, XCircle, UserPlus, MessageSquare } from "lucide-react"

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

interface AlertActionDialogProps {
  alert: Alert | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

const supportTeam = [
  { id: "suporte1", name: "João Silva", role: "Suporte Técnico", status: "available" },
  { id: "suporte2", name: "Maria Santos", role: "Especialista Senior", status: "available" },
  { id: "suporte3", name: "Pedro Costa", role: "Suporte Técnico", status: "busy" },
  { id: "suporte4", name: "Ana Oliveira", role: "Coordenadora", status: "available" },
  { id: "suporte5", name: "Carlos Ferreira", role: "Suporte Técnico", status: "offline" },
]

const statusOptions = [
  { value: "open", label: "Aberto", icon: XCircle, color: "text-red-500" },
  { value: "in_progress", label: "Em Progresso", icon: Clock, color: "text-yellow-500" },
  { value: "resolved", label: "Resolvido", icon: CheckCircle2, color: "text-green-500" },
  { value: "ignored", label: "Ignorado", icon: XCircle, color: "text-gray-500" },
]

export function AlertActionDialog({ alert, open, onOpenChange, onUpdate }: AlertActionDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(alert?.status || "open")
  const [selectedSupport, setSelectedSupport] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!alert) return

    setLoading(true)
    try {
      const updates: any = {}
      
      if (selectedStatus !== alert.status) {
        updates.status = selectedStatus
      }
      
      if (selectedSupport) {
        const supportName = supportTeam.find((s) => s.id === selectedSupport)?.name
        updates.assigned_to = supportName
      }

      // Faz a chamada real à API
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao atualizar alerta')
      }

      console.log("Alerta atualizado com sucesso:", data.alert)

      // Se houver notas, você pode adicionar um endpoint separado para isso
      if (notes) {
        console.log("Notas adicionadas:", notes)
        // await fetch(`/api/alerts/${alert.id}/notes`, {
        //   method: 'POST',
        //   body: JSON.stringify({ note: notes })
        // })
      }

      onUpdate()
      onOpenChange(false)
      setNotes("")
      setSelectedSupport("")
    } catch (error) {
      console.error("Erro ao atualizar alerta:", error)
      window.alert("Erro ao atualizar o alerta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (!alert) return null

  const currentStatusOption = statusOptions.find((s) => s.value === selectedStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Gerenciar Alerta #{alert.id}</DialogTitle>
          <DialogDescription>{alert.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alert Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cliente:</span>
              <span className="text-sm">{alert.client_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tipo:</span>
              <span className="text-sm">{alert.alert_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Severidade:</span>
              <Badge variant="outline">{alert.severity}</Badge>
            </div>
          </div>

          {/* Status Change */}
          <div className="space-y-2">
            <Label htmlFor="status">Alterar Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Alert["status"])}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign to Support */}
          <div className="space-y-2">
            <Label htmlFor="support">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Transferir para Suporte
              </div>
            </Label>
            <Select value={selectedSupport} onValueChange={setSelectedSupport}>
              <SelectTrigger id="support">
                <SelectValue placeholder="Selecione um responsável..." />
              </SelectTrigger>
              <SelectContent>
                {supportTeam.map((support) => (
                  <SelectItem key={support.id} value={support.id} disabled={support.status === "offline"}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{support.name}</div>
                          <div className="text-xs text-muted-foreground">{support.role}</div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          support.status === "available"
                            ? "default"
                            : support.status === "busy"
                            ? "secondary"
                            : "outline"
                        }
                        className="ml-auto"
                      >
                        {support.status === "available" && "Disponível"}
                        {support.status === "busy" && "Ocupado"}
                        {support.status === "offline" && "Offline"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Adicionar Observações
              </div>
            </Label>
            <Textarea
              id="notes"
              placeholder="Descreva as ações tomadas, investigações realizadas ou próximos passos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Preview of changes */}
          {(selectedStatus !== alert.status || selectedSupport || notes) && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Alterações a serem aplicadas:
              </div>
              <ul className="text-sm space-y-1 ml-6 list-disc">
                {selectedStatus !== alert.status && (
                  <li>
                    Status será alterado para:{" "}
                    <span className="font-semibold">{currentStatusOption?.label}</span>
                  </li>
                )}
                {selectedSupport && (
                  <li>
                    Alerta será transferido para:{" "}
                    <span className="font-semibold">
                      {supportTeam.find((s) => s.id === selectedSupport)?.name}
                    </span>
                  </li>
                )}
                {notes && <li>Observações serão adicionadas ao histórico</li>}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
