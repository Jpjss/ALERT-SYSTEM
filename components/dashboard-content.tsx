'use client'

import { Settings, User, LogOut, UserCircle, Shield, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IntegratedDashboard } from '@/components/integrated-dashboard'
import { AlertsView } from '@/components/alerts-view'
import { HistoryView } from '@/components/history-view'
import { ClientMap } from '@/components/client-map'
import { SettingsDialog } from '@/components/settings-dialog'
import { UserProfileDialog } from '@/components/user-profile-dialog'
import { SecurityDialog } from '@/components/security-dialog'
import { NotificationsPreferencesDialog } from '@/components/notifications-preferences-dialog'

interface DashboardContentProps {
  activeView: string
}

const viewTitles = {
  dashboard: 'Dashboard de Alertas',
  alerts: 'Gerenciar Alertas',
  history: 'Histórico de Alertas',
  map: 'Mapa de Clientes',
  settings: 'Configurações',
}

export function DashboardContent({ activeView }: DashboardContentProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userName] = useState("Administrador")
  const [userEmail] = useState("admin@systeceye.com")
  
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      // Aqui você pode adicionar a lógica de logout
      console.log("Logout realizado")
    }
  }
  
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {viewTitles[activeView as keyof typeof viewTitles] || 'Dashboard de Alertas'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSecurityOpen(true)}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Segurança</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNotificationsOpen(true)}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notificações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className={activeView === 'map' ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-8"}>
        {activeView === 'dashboard' && <IntegratedDashboard />}
        {activeView === 'alerts' && <AlertsView />}
        {activeView === 'history' && <HistoryView />}
        {activeView === 'map' && <ClientMap />}
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} />
      <NotificationsPreferencesDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
