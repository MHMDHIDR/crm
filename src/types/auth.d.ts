// types/auth.d.ts
import type { UserRole } from '@/db/schema'
import type { AdapterUser } from '@auth/core/adapters'
import type { DefaultSession } from 'next-auth'

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: UserRole
    isTwoFactorEnabled: boolean
    emailVerified: Date | null
  }
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string | null
      email: string
      role: UserRole
      supervisorId: User['supervisorId']
      image?: string | null
      isTwoFactorEnabled: boolean
      theme?: 'light' | 'dark' | 'system'
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User extends AdapterUser {
    id: string
    name: string | null
    email: string
    image?: string | null
    theme?: 'light' | 'dark' | 'system'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    sessionId?: string
    isTwoFactorEnabled: boolean
    name: string | null
    email: string
  }
}
