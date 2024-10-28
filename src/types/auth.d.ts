// Type declarations should come before usage
export declare module 'next-auth' {
  interface User {
    role?: string
    employeeId?: number
  }

  interface Session {
    user: {
      id: string
      role?: string
      employeeId?: number
    } & DefaultSession['user']
  }
}

export declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    employeeId?: number
  }
}
