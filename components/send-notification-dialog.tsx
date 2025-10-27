"use client"

import { useState } from "react"
import { Mail, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface SendNotificationDialogProps {
  alert: {
    id: number
    title: string
    description: string
    severity: string
    client_name: string
  }
}

export function SendNotificationDialog({ alert }: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [channels, setChannels] = useState<string[]>(["email"])
  const { toast } = useToast()

  const handleSend = async () => {
    if (channels.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um canal de notificação",
        variant: "destructive",
      })
      return
    }

    if (channels.includes("email") && !email) {
      toast({
        title: "Erro",
        description: "Informe o email do destinatário",
        variant: "destructive",
      })
      return
    }

    if (channels.includes("whatsapp") && !phone) {
      toast({
        title: "Erro",
        description: "Informe o telefone do destinatário",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: alert.id,
          channels,
          recipients: { email, phone },
          alert: {
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            clientName: alert.client_name,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Notificações enviadas",
          description: "As notificações foram enviadas com sucesso",
        })
        setOpen(false)
      } else {
        throw new Error("Falha ao enviar notificações")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar as notificações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Send className="w-4 h-4" />
          Enviar Notificação
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>Envie uma notificação sobre este alerta para os responsáveis</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Canais de Notificação</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email"
                  checked={channels.includes("email")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "email"])
                    } else {
                      setChannels(channels.filter((c) => c !== "email"))
                    }
                  }}
                />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="whatsapp"
                  checked={channels.includes("whatsapp")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "whatsapp"])
                    } else {
                      setChannels(channels.filter((c) => c !== "whatsapp"))
                    }
                  }}
                />
                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Label>
              </div>
            </div>
          </div>

          {channels.includes("email") && (
            <div className="space-y-2">
              <Label htmlFor="email-input">Email do Destinatário</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          )}

          {channels.includes("whatsapp") && (
            <div className="space-y-2">
              <Label htmlFor="phone-input">Telefone (WhatsApp)</Label>
              <Input
                id="phone-input"
                type="tel"
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
