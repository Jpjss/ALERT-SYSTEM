'use client'

import { RoleGuard } from '@/components/role-guard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Settings, Database } from 'lucide-react'

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">Área restrita para administradores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <h3 className="text-lg font-semibold mb-2">Gerenciamento de Usuários</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicionar, editar e remover usuários do sistema
            </p>
            <Button className="w-full" variant="outline">
              Gerenciar Usuários
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-green-500" />
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <h3 className="text-lg font-semibold mb-2">Configurações do Sistema</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configurar parâmetros globais e integrações
            </p>
            <Button className="w-full" variant="outline">
              Configurações
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Database className="w-6 h-6 text-purple-500" />
              </div>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <h3 className="text-lg font-semibold mb-2">Banco de Dados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Backup, restore e manutenção do banco de dados
            </p>
            <Button className="w-full" variant="outline">
              Gerenciar BD
            </Button>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Acesso</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Esta área é acessível apenas para usuários com role <Badge variant="destructive">admin</Badge>
            </p>
            <p className="text-muted-foreground">
              Gerentes têm acesso limitado às funções de gerenciamento de alertas.
            </p>
            <p className="text-muted-foreground">
              Usuários padrão podem apenas visualizar e responder a alertas.
            </p>
          </div>
        </Card>
      </div>
    </RoleGuard>
  )
}
