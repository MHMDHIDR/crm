import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { and, eq, lt } from 'drizzle-orm'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { database } from '@/db'
import { sessions, users } from '@/db/schema'
import { hashedString } from '@/lib/hashed-string'
import type { UserRole, UserSession } from '@/db/schema'
import type { User } from 'next-auth'

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(database),
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        // Ensure user and user.id exist AND Store user role in the JWT
        token.role = user.role

        const sessionToken = crypto.randomUUID()
        const [session] = await database
          .insert(sessions)
          .values({
            sessionToken,
            userId: user.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            role: user.role as UserRole
          })
          .returning()

        if (session) {
          token.sessionId = session.sessionToken
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as UserRole

        // Verify the database session is still valid
        const [dbSession] = await database
          .select()
          .from(sessions)
          .where(eq(sessions.sessionToken, token.sessionId as string))

        if (!dbSession || new Date(dbSession.expires) < new Date()) {
          // Session has expired, force sign out
          throw new Error('Session expired')
        }
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

          // Find the user in the users table
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

          // Clean up expired sessions for this user
          await database
            .delete(sessions)
            .where(and(eq(sessions.userId, user.id), lt(sessions.expires, new Date())))

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
          } as UserSession
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  events: {
    async signOut(message) {
      // Clean up the database session when user signs out
      if ('token' in message && message.token?.sessionId) {
        await database
          .delete(sessions)
          .where(eq(sessions.sessionToken, message.token.sessionId as string))
      }
    }
  }
})
