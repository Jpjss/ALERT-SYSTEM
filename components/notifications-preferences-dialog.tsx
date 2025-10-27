"use client"

import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, MessageSquare, Volume2, Save, AlertCircle } from "lucide-react"

interface NotificationsPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsPreferencesDialog({ open, onOpenChange }: NotificationsPreferencesDialogProps) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [highAlerts, setHighAlerts] = useState(true)
  const [mediumAlerts, setMediumAlerts] = useState(false)
  const [lowAlerts, setLowAlerts] = useState(false)
  const [statusUpdates, setStatusUpdates] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [monthlyReports, setMonthlyReports] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const savedPrefs = localStorage.getItem("notificationPreferences")
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setEmailAlerts(prefs.emailAlerts ?? true)
      setWhatsappAlerts(prefs.whatsappAlerts ?? true)
      setSoundAlerts(prefs.soundAlerts ?? true)
      setCriticalAlerts(prefs.criticalAlerts ?? true)
      setHighAlerts(prefs.highAlerts ?? true)
      setMediumAlerts(prefs.mediumAlerts ?? false)
      setLowAlerts(prefs.lowAlerts ?? false)
      setStatusUpdates(prefs.statusUpdates ?? true)
      setWeeklyReports(prefs.weeklyReports ?? true)
      setMonthlyReports(prefs.monthlyReports ?? false)
    }
  }, [open])

  const handleSave = () => {
    setSaving(true)
    
    const preferences = {
      emailAlerts,
      whatsappAlerts,
      soundAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      statusUpdates,
      weeklyReports,
      monthlyReports,
    }
    
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences))
    
    setTimeout(() => {
      setSaving(false)
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure como e quando você deseja receber notificações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Canais de Notificação</h3>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-xs text-muted-foreground">Receber notificações por email</p>
                </div>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-xs text-muted-foreground">Receber notificações via WhatsApp</p>
                </div>
              </div>
              <Switch checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-orange-500" />
                <div>
                  <Label className="text-sm font-medium">Som</Label>
                  <p className="text-xs text-muted-foreground">Reproduzir som ao receber alertas</p>
                </div>
              </div>
              <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
            </div>
          </div>

          <Separator />

          {/* Alert Severity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Níveis de Severidade</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha quais níveis de severidade você deseja receber notificações
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-red-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <Label className="text-sm font-medium">Crítico</Label>
                </div>
                <Switch checked={criticalAlerts} onCheckedChange={setCriticalAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-orange-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <Label className="text-sm font-medium">Alto</Label>
                </div>
                <Switch checked={highAlerts} onCheckedChange={setHighAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-yellow-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <Label className="text-sm font-medium">Médio</Label>
                </div>
                <Switch checked={mediumAlerts} onCheckedChange={setMediumAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-blue-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Label className="text-sm font-medium">Baixo</Label>
                </div>
                <Switch checked={lowAlerts} onCheckedChange={setLowAlerts} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Other Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Outras Notificações</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Atualizações de Status</Label>
                  <p className="text-xs text-muted-foreground">Mudanças no status dos alertas</p>
                </div>
                <Switch checked={statusUpdates} onCheckedChange={setStatusUpdates} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Relatório Semanal</Label>
                  <p className="text-xs text-muted-foreground">Resumo dos alertas da semana</p>
                </div>
                <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Relatório Mensal</Label>
                  <p className="text-xs text-muted-foreground">Resumo dos alertas do mês</p>
                </div>
                <Switch checked={monthlyReports} onCheckedChange={setMonthlyReports} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Preferências
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
