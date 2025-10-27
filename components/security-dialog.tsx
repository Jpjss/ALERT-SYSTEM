"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Key, Smartphone, Lock, Eye, EyeOff, Save, AlertTriangle } from "lucide-react"

interface SecurityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SecurityDialog({ open, onOpenChange }: SecurityDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }
    
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      alert("Senha alterada com sucesso!")
    }, 500)
  }

  const handleSaveSecurity = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert("Configurações de segurança atualizadas!")
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança da Conta
          </DialogTitle>
          <DialogDescription>
            Gerencie suas configurações de segurança e autenticação
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Requisitos da senha:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Mínimo de 8 caracteres</li>
                  <li>• Pelo menos uma letra maiúscula</li>
                  <li>• Pelo menos uma letra minúscula</li>
                  <li>• Pelo menos um número</li>
                  <li>• Pelo menos um caractere especial</li>
                </ul>
              </div>

              <Button onClick={handleSavePassword} disabled={saving} className="w-full">
                {saving ? "Salvando..." : "Alterar Senha"}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              {twoFactorEnabled && (
                <div className="ml-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Configurar Autenticação de Dois Fatores
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use um aplicativo autenticador como Google Authenticator ou Microsoft Authenticator
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Key className="mr-2 h-4 w-4" />
                    Configurar Agora
                  </Button>
                </div>
              )}

              {/* Login Alerts */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Alertas de Login</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Receba notificações sobre novos logins em sua conta
                    </p>
                  </div>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Sessões Ativas</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium">Windows - Chrome</p>
                      <p className="text-xs text-muted-foreground">São Paulo, Brasil • Atual</p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">Ativa</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium">Android - Mobile App</p>
                      <p className="text-xs text-muted-foreground">São Paulo, Brasil • Há 2 horas</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      Encerrar
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
