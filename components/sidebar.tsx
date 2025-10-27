"use client"

import { Bell, LayoutDashboard, History, Settings, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { SettingsDialog } from "./settings-dialog"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Painel", icon: LayoutDashboard },
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "history", label: "Histórico", icon: History },
    { id: "map", label: "Mapa", icon: Map },
    { id: "settings", label: "Configurações", icon: Settings },
  ]

  const handleItemClick = (itemId: string) => {
    onViewChange(itemId)
  }

  return (
    <>
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground">SystecEye</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeView === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <SettingsDialog 
        open={activeView === "settings"} 
        onOpenChange={(open) => !open && onViewChange("dashboard")} 
      />
    </>
  )
}
