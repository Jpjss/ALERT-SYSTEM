import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname.startsWith('/login')
      const isOnAuth = nextUrl.pathname.startsWith('/api/auth')

      // Allow auth API routes
      if (isOnAuth) {
        return true
      }

      // Redirect logged-in users away from login page
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/', nextUrl))
      }

      // Redirect unauthenticated users to login
      if (!isLoggedIn && !isOnLogin) {
        return false
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials.email as string
        const password = credentials.password as string

        if (!email || !password) {
          return null
        }

        try {
          // Import only on server-side during authentication
          const bcrypt = await import('bcryptjs')
          const { Pool } = await import('pg')

          const pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'alert_system',
            user: process.env.DB_USER || 'alert_user',
            password: process.env.DB_PASSWORD || 'postgres',
          })

          const result = await pool.query(
            'SELECT id, name, email, password, role FROM users WHERE email = $1',
            [email]
          )

          const user = result.rows[0]

          if (!user) {
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (!passwordsMatch) {
            return null
          }

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
} satisfies NextAuthConfig
