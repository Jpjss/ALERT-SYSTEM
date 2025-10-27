"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  UserPlus,
  Eye,
  Trash2,
} from "lucide-react"

interface QuickActionsMenuProps {
  alertId: number
  onStatusChange: (status: string) => void
  onAssign: () => void
  onView: () => void
  onDelete: () => void
}

export function QuickActionsMenu({
  alertId,
  onStatusChange,
  onAssign,
  onView,
  onDelete,
}: QuickActionsMenuProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onStatusChange(newStatus)
      } else {
        throw new Error(data.error || 'Falha ao atualizar')
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro ao atualizar o status. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este alerta?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onDelete()
      } else {
        throw new Error(data.error || 'Falha ao excluir')
      }
    } catch (error) {
      console.error("Erro ao excluir alerta:", error)
      alert("Erro ao excluir o alerta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onAssign}>
          <UserPlus className="mr-2 h-4 w-4" />
          Transferir para Suporte
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mudar Status
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
          <Clock className="mr-2 h-4 w-4 text-yellow-500" />
          Marcar Em Progresso
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleStatusChange("resolved")}>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          Marcar como Resolvido
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleStatusChange("ignored")}>
          <XCircle className="mr-2 h-4 w-4 text-gray-500" />
          Ignorar Alerta
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
