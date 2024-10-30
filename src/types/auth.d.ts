import type { UserSession } from '@/db/schema'

// Extend the built-in session types to include role
export declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserSession
  }

  interface User {
    role: string | null
  }
}
