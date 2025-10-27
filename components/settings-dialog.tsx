"use client"

import { Moon, Sun, Monitor, Bell, Mail, MessageSquare, Clock, RefreshCw, Save } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("alertSystemSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setEmailNotifications(settings.emailNotifications ?? true)
      setWhatsappNotifications(settings.whatsappNotifications ?? true)
      setSoundAlerts(settings.soundAlerts ?? true)
      setAutoRefresh(settings.autoRefresh ?? true)
      setRefreshInterval(settings.refreshInterval ?? "30")
      setEmail(settings.email ?? "")
      setPhone(settings.phone ?? "")
    }
  }, [])

  const handleSave = () => {
    setSaving(true)
    
    const settings = {
      emailNotifications,
      whatsappNotifications,
      soundAlerts,
      autoRefresh,
      refreshInterval,
      email,
      phone,
    }
    
    localStorage.setItem("alertSystemSettings", JSON.stringify(settings))
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }))
    
    setTimeout(() => {
      setSaving(false)
      onOpenChange(false)
    }, 500)
  }

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configurações do Sistema</DialogTitle>
          <DialogDescription>
            Personalize as preferências e notificações do seu dashboard de alertas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold">Tema do Sistema</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Escolha o tema que melhor se adapta ao seu ambiente
              </p>

              <div className="grid grid-cols-3 gap-3">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon
                  const isActive = mounted && theme === themeOption.value

                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value)}
                      className={`
                        flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all
                        ${isActive ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}
                      `}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                        {themeOption.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">Alertas Sonoros</Label>
                    <p className="text-xs text-muted-foreground">Reproduzir som ao receber novos alertas</p>
                  </div>
                </div>
                <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold">Canais de Notificação</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Configure como deseja receber notificações de alertas críticos
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-xs text-muted-foreground">Receber notificações por email</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                {emailNotifications && (
                  <div className="ml-12 space-y-2">
                    <Label htmlFor="email" className="text-sm">Endereço de Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <Label className="text-sm font-medium">WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">Receber notificações via WhatsApp</p>
                    </div>
                  </div>
                  <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
                </div>

                {whatsappNotifications && (
                  <div className="ml-12 space-y-2">
                    <Label htmlFor="phone" className="text-sm">Número de Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+55 (11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold">Atualização Automática</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Configure a frequência de atualização dos dados
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Auto-Refresh</Label>
                      <p className="text-xs text-muted-foreground">Atualizar dados automaticamente</p>
                    </div>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                {autoRefresh && (
                  <div className="ml-12 space-y-2">
                    <Label htmlFor="interval" className="text-sm">Intervalo de Atualização</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger id="interval">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">1 minuto</SelectItem>
                        <SelectItem value="300">5 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Label className="text-base font-semibold">Informações do Sistema</Label>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Versão:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-muted-foreground">Última Atualização:</span>
                  <span className="font-medium">23/10/2025</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
