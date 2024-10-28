import { hash } from 'crypto'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { and, eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { database } from '@/db'
import { accounts, sessions, systemEmployeeInfo, users, verificationTokens } from '@/db/schema'

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.employeeId = user.employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.employeeId = token.employeeId as number
      }
      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Hash the provided password to match stored hash
          const hashedPassword = hash('sha256', credentials.password.toString())

          // Find the employee in systemEmployeeInfo
          const [employee] = await database
            .select()
            .from(systemEmployeeInfo)
            .where(
              and(
                eq(systemEmployeeInfo.username, credentials.username.toString()),
                eq(systemEmployeeInfo.password, hashedPassword)
              )
            )

          if (!employee) {
            return null
          }

          // Return the user object that will be saved in the token
          return {
            id: employee.id.toString(),
            employeeId: employee.employeeId,
            name: credentials.username.toString(),
            email: `${credentials.username}@example.com`,
            role: employee.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
})
