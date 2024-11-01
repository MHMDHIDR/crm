import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { and, eq, lt } from 'drizzle-orm'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { database } from '@/db'
import { sessions, twoFactorConfirmations, users } from '@/db/schema'
import { compareHashedStrings } from '@/lib/crypt'
import { getUserById } from '@/services/user'
import { getTwoFactorConfirmationByUserId } from './services/two-factor-confirmation'
import type { UserRole, UserSession } from '@/db/schema'
import type { User } from 'next-auth'

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: update
} = NextAuth({
  adapter: DrizzleAdapter(database),
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async signIn({ user }) {
      const existingUser = await getUserById(user.id as string)

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

        if (!twoFactorConfirmation) return false

        // Delete two factor confirmation for next sign in
        await database
          .delete(twoFactorConfirmations)
          .where(eq(twoFactorConfirmations.userId, twoFactorConfirmation.id))
      }

      return true
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.sub as UserSession['id']
        session.user.name = token.name as UserSession['name']
        session.user.email = token.email as UserSession['email']
        session.user.role = token.role as UserRole
        session.user.isTwoFactorEnabled =
          token.isTwoFactorEnabled as UserSession['isTwoFactorEnabled']

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
    },
    async jwt({ token, user }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)
      if (!existingUser) return token

      token.name = existingUser.name
      token.role = existingUser.role
      token.email = existingUser.email
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

      if (user?.id) {
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

        token.sessionId = session.sessionToken
      }

      return token
    }
    // ,async authorized({ auth }) {
    //   return !!auth
    // }
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
          const plainPassword = credentials.password as string

          // Find the user in the users table
          const [user] = await database
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))

          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = compareHashedStrings(plainPassword, user.hashedPassword as string)

          if (!isValidPassword) {
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
    // ,async linkAccount({ user }) {
    //   await database
    //     .update(users)
    //     .set({ emailVerified: new Date() })
    //     .where(eq(users.id, user.id as string))
    // }
  }
})
