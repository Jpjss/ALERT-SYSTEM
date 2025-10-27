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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Briefcase, Save, Upload } from "lucide-react"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const [name, setName] = useState("Administrador")
  const [email, setEmail] = useState("admin@systeceye.com")
  const [phone, setPhone] = useState("+55 (11) 99999-9999")
  const [location, setLocation] = useState("São Paulo, SP")
  const [role, setRole] = useState("Administrador do Sistema")
  const [bio, setBio] = useState("Responsável pelo monitoramento e gerenciamento de alertas do sistema.")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setName(profile.name || "Administrador")
      setEmail(profile.email || "admin@systeceye.com")
      setPhone(profile.phone || "+55 (11) 99999-9999")
      setLocation(profile.location || "São Paulo, SP")
      setRole(profile.role || "Administrador do Sistema")
      setBio(profile.bio || "Responsável pelo monitoramento e gerenciamento de alertas do sistema.")
    }
  }, [open])

  const handleSave = () => {
    setSaving(true)
    
    const profile = {
      name,
      email,
      phone,
      location,
      role,
      bio,
    }
    
    localStorage.setItem("userProfile", JSON.stringify(profile))
    
    setTimeout(() => {
      setSaving(false)
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Meu Perfil</DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e configurações de perfil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Alterar Foto
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG ou GIF. Tamanho máximo de 2MB.
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cidade, Estado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Seu cargo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={4}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">127</div>
              <div className="text-xs text-muted-foreground">Alertas Gerenciados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-xs text-muted-foreground">Taxa de Resolução</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">45min</div>
              <div className="text-xs text-muted-foreground">Tempo Médio</div>
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
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
