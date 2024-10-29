import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { database } from '@/db'
import { users } from '@/db/schema'
import { hashedString } from '@/lib/utils'
import type { User } from 'next-auth'

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(database),
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role
      }
      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const hashedPassword = hashedString(credentials.password as string)

          // Find the user in the users table with proper type handling
          const [user] = await database
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))

          if (!user) {
            return null
          }

          // Verify password
          if (user.hashedPassword !== hashedPassword) {
            return null
          }

          // Return the user object that will be saved in the token
          return {
            id: user.id,
            name: user.name || null,
            email: user.email,
            role: user.userRole || null // Handle potential null value
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
})
