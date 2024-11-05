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
      name: string
      email: string
      role: UserRole
      image: string
      isTwoFactorEnabled: boolean
      theme?: 'light' | 'dark' | null
      emailVerified: Date | null
    }
  }

  interface User extends AdapterUser {
    id: string
    name: string
    email: string
    role: UserRole
    image: string
    isTwoFactorEnabled: boolean
    emailVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    sessionId?: string
    isTwoFactorEnabled: boolean | null
  }
}
