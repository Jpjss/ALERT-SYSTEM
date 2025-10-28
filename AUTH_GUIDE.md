# Sistema de Autenticação - ALERT SYSTEM

## 📋 Visão Geral

O sistema ALERT implementa autenticação completa usando **NextAuth.js v5** com as seguintes funcionalidades:

- ✅ Login com email e senha
- ✅ Proteção de rotas via middleware
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Sessões seguras com JWT
- ✅ Hash de senhas com bcrypt
- ✅ Integração com PostgreSQL

## 🔐 Roles e Permissões

### Roles Disponíveis

1. **Admin** - Acesso total ao sistema
   - Gerenciamento de usuários
   - Configurações do sistema
   - Todas as funcionalidades de Manager e User

2. **Manager** - Gerenciamento de alertas
   - Visualizar todos os alertas
   - Criar e editar alertas
   - Atribuir alertas para usuários
   - Visualizar relatórios

3. **User** - Usuário padrão
   - Visualizar alertas atribuídos
   - Responder a alertas
   - Visualizar dashboard básico

## 👥 Usuários Padrão

### Credenciais de Teste

| Role    | Email                      | Senha      |
|---------|----------------------------|------------|
| Admin   | admin@alertsystem.com      | admin123   |
| Manager | manager@alertsystem.com    | manager123 |
| User    | user@alertsystem.com       | user123    |

**⚠️ IMPORTANTE:** Altere essas senhas em produção!

## 🛠️ Arquitetura

### Arquivos Principais

```
auth.config.ts          # Configuração do NextAuth
auth.ts                 # Exportação dos handlers
middleware.ts           # Proteção de rotas
app/api/auth/[...nextauth]/route.ts  # API endpoints
app/login/page.tsx      # Página de login
components/user-menu.tsx           # Menu do usuário
components/role-guard.tsx          # Proteção por role
types/next-auth.d.ts    # Tipos TypeScript
```

### Fluxo de Autenticação

1. **Login**: Usuário insere email e senha
2. **Validação**: Credenciais verificadas no banco de dados
3. **Hash**: Senha comparada com bcrypt
4. **JWT**: Token gerado com informações do usuário
5. **Session**: Sessão armazenada e gerenciada
6. **Middleware**: Todas as rotas protegidas automaticamente

## 🔧 Configuração

### Variáveis de Ambiente (.env.local)

```bash
# Database
DATABASE_URL=postgresql://alert_user:postgres@localhost:5432/alert_system

# NextAuth
AUTH_SECRET=your-super-secret-key-change-this-in-production-minimum-32-characters
AUTH_URL=http://localhost:3000
```

### Gerar AUTH_SECRET

```bash
# PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Ou use um gerador online
# https://generate-secret.vercel.app/32
```

## 📊 Banco de Dados

### Tabela de Usuários

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Executar Migration

```bash
# Criar tabela e usuários padrão
cd scripts
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U alert_user -d alert_system -f 004_create_users_table.sql
```

## 💻 Uso no Código

### Proteger uma Página (Server Component)

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>Conteúdo protegido</div>
}
```

### Proteger por Role (Client Component)

```tsx
'use client'
import { RoleGuard } from '@/components/role-guard'

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>Área administrativa</div>
    </RoleGuard>
  )
}
```

### Obter Sessão (Client Component)

```tsx
'use client'
import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Carregando...</div>
  if (!session) return <div>Não autenticado</div>
  
  return <div>Olá, {session.user.name}!</div>
}
```

### Fazer Logout

```tsx
'use client'
import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })}>
      Sair
    </button>
  )
}
```

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT com expiração
- ✅ Middleware para proteção automática de rotas
- ✅ Validação de credenciais no server-side
- ✅ Conexão segura com banco de dados
- ✅ Session cookies com httpOnly

### Recomendações para Produção

1. **Alterar AUTH_SECRET**: Use um valor aleatório e seguro
2. **HTTPS**: Configure SSL/TLS no servidor
3. **Rate Limiting**: Implemente limite de tentativas de login
4. **2FA**: Considere adicionar autenticação de dois fatores
5. **Senhas Fortes**: Force políticas de senha complexa
6. **Logs**: Monitore tentativas de login suspeitas
7. **Session Timeout**: Configure tempo de expiração adequado

## 🧪 Testes

### Testar Login

1. Acesse `http://localhost:3000`
2. Você será redirecionado para `/login`
3. Use uma das credenciais de teste
4. Verifique se foi redirecionado para o dashboard

### Testar Proteção de Rotas

1. Tente acessar `/admin` sem login
2. Deve redirecionar para `/login`
3. Faça login com `user@alertsystem.com`
4. Tente acessar `/admin` novamente
5. Deve redirecionar para `/` (sem permissão)
6. Faça login com `admin@alertsystem.com`
7. Acesse `/admin` - deve funcionar

## 🔄 Adicionar Novos Usuários

### Via Código

```typescript
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'

async function createUser(name: string, email: string, password: string, role: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    [name, email, hashedPassword, role]
  )
}
```

### Via SQL

```sql
-- Gere o hash primeiro usando o script
node scripts/generate-password-hashes.js

-- Insira no banco
INSERT INTO users (name, email, password, role)
VALUES ('Nome', 'email@example.com', '$2b$10$...hash...', 'user');
```

## 📝 Customização

### Adicionar Novos Providers

```typescript
// auth.config.ts
import Google from 'next-auth/providers/google'

providers: [
  Credentials({ /* ... */ }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
]
```

### Customizar Callbacks

```typescript
// auth.config.ts
callbacks: {
  async signIn({ user, account }) {
    // Lógica customizada de sign-in
    return true
  },
  async session({ session, token }) {
    // Adicionar dados extras à sessão
    return session
  },
}
```

## 🐛 Troubleshooting

### Erro: "Invalid credentials"
- Verifique se o email está correto
- Verifique se a senha está correta
- Confirme que o usuário existe no banco de dados

### Erro: "Database connection failed"
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais do banco de dados
- Verifique a variável DATABASE_URL

### Erro: "Session not found"
- Verifique se AUTH_SECRET está configurado
- Limpe os cookies do navegador
- Reinicie o servidor

### Redirecionamento infinito
- Verifique o middleware.ts
- Confirme que /login está nas rotas públicas
- Verifique os callbacks de authorized

## 📚 Recursos Adicionais

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Desenvolvido para ALERT SYSTEM** | Última atualização: Outubro 2025
