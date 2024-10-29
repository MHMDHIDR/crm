// Extend the built-in session types to include role
export declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: string | null
  }
}
