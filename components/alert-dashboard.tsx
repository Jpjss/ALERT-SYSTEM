"use client"

import { useState } from "react"
import { AlertList } from "@/components/alert-list"
import { AlertFilters } from "@/components/alert-filters"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AlertDashboard() {
  const [filters, setFilters] = useState({
    status: "all",
    severity: "all",
    search: "",
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Alertas</h2>
        <AlertFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="in_progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AlertList filters={{ ...filters, status: "all" }} />
        </TabsContent>

        <TabsContent value="open" className="mt-4">
          <AlertList filters={{ ...filters, status: "open" }} />
        </TabsContent>

        <TabsContent value="in_progress" className="mt-4">
          <AlertList filters={{ ...filters, status: "in_progress" }} />
        </TabsContent>

        <TabsContent value="resolved" className="mt-4">
          <AlertList filters={{ ...filters, status: "resolved" }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
