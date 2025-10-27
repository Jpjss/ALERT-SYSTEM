"use client"

import { useState } from "react"
import { MoreVertical, CheckCircle2, Clock, XCircle, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AlertActionsMenuProps {
  alert: {
    id: number
    status: string
    title: string
  }
  onAlertUpdated?: () => void
}

export function AlertActionsMenu({ alert, onAlertUpdated }: AlertActionsMenuProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignee, setAssignee] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const updateAlertStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Status atualizado",
          description: `O alerta foi marcado como ${newStatus === "in_progress" ? "em progresso" : newStatus === "resolved" ? "resolvido" : "ignorado"}`,
        })
        onAlertUpdated?.()
      } else {
        throw new Error("Falha ao atualizar status")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do alerta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const assignAlert = async () => {
    if (!assignee.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome do responsável",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignee }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Alerta atribuído",
          description: `O alerta foi atribuído para ${assignee}`,
        })
        setAssignDialogOpen(false)
        setAssignee("")
        onAlertUpdated?.()
      } else {
        throw new Error("Falha ao atribuir alerta")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o alerta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteAlert = async () => {
    if (!confirm("Tem certeza que deseja excluir este alerta?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Alerta excluído",
          description: "O alerta foi excluído com sucesso",
        })
        onAlertUpdated?.()
      } else {
        throw new Error("Falha ao excluir alerta")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o alerta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {alert.status !== "in_progress" && (
            <DropdownMenuItem onClick={() => updateAlertStatus("in_progress")} className="cursor-pointer">
              <Clock className="w-4 h-4 mr-2" />
              Marcar em Progresso
            </DropdownMenuItem>
          )}

          {alert.status !== "resolved" && (
            <DropdownMenuItem onClick={() => updateAlertStatus("resolved")} className="cursor-pointer">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como Resolvido
            </DropdownMenuItem>
          )}

          {alert.status !== "ignored" && (
            <DropdownMenuItem onClick={() => updateAlertStatus("ignored")} className="cursor-pointer">
              <XCircle className="w-4 h-4 mr-2" />
              Ignorar Alerta
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setAssignDialogOpen(true)} className="cursor-pointer">
            <UserPlus className="w-4 h-4 mr-2" />
            Atribuir Responsável
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={deleteAlert} className="cursor-pointer text-error focus:text-error">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Alerta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-popover border-border">
          <DialogHeader>
            <DialogTitle>Atribuir Responsável</DialogTitle>
            <DialogDescription>Defina quem será responsável por resolver este alerta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Nome do Responsável</Label>
              <Input
                id="assignee"
                placeholder="Ex: João Silva"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={assignAlert} disabled={loading}>
              {loading ? "Atribuindo..." : "Atribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
