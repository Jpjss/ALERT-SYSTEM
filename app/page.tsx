"use client"

import { Suspense, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8">Carregando...</div>}>
          <DashboardContent activeView={activeView} />
        </Suspense>
      </main>
    </div>
  )
}
