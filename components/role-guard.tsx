'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackUrl?: string
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = '/' }: RoleGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (!allowedRoles.includes(session.user.role)) {
      router.push(fallbackUrl)
      return
    }
  }, [session, status, router, allowedRoles, fallbackUrl])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}
