"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AlertFiltersProps {
  filters: {
    status: string
    severity: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export function AlertFilters({ filters, onFiltersChange }: AlertFiltersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel>Severidade</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={filters.severity}
          onValueChange={(value) => onFiltersChange({ ...filters, severity: value })}
        >
          <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="critical">Crítica</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="high">Alta</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="medium">Média</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="low">Baixa</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Tipo de Alerta</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="all">
          <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="backup_failed">Backup</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="stock_zero">Estoque</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="nfe_error">NF-e</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
