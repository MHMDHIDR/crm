import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { and, eq, lt } from 'drizzle-orm'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserById } from '@/actions/users/get-users'
import { database } from '@/db'
import { sessions, twoFactorConfirmations, userPreferences, users } from '@/db/schema'
import { compareHashedStrings } from '@/lib/crypt'
import { getTwoFactorConfirmationByUserId } from './actions/auth/two-factor-confirmation'
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
      const { data: existingUser } = await getUserById(user.id as string)

      // TODO: check if this is necessary
      if (!existingUser) return false // Prevent sign in without user TODO: check if this is necessary
      // TODO: check if this is necessary

      // Prevent sign in without email verification
      if (!existingUser.emailVerified) return false

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
        // Another way: session.user.isTwoFactorEnabled =  (token.isTwoFactorEnabled as UserSession['isTwoFactorEnabled']) ?? false

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

      const { data: existingUser } = await getUserById(token.sub)
      if (!existingUser) return token

      token.name = existingUser.name
      token.role = existingUser.role
      token.email = existingUser.email
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

      // Add the session ID to the token
      if (user?.id) {
        const sessionToken = crypto.randomUUID()
        const [session] = await database
          .insert(sessions)
          .values({
            sessionToken,
            userId: user.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
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

          // Find the user in the users table, join with user_preferences from userPreferences table
          const [userWithPreferences] = await database
            .select()
            .from(users)
            .leftJoin(userPreferences, eq(users.id, userPreferences.userId))
            .where(eq(users.email, credentials.email as string))

          if (!userWithPreferences) {
            return null
          }

          // Verify password
          const isValidPassword = compareHashedStrings(
            plainPassword,
            userWithPreferences.users.hashedPassword as string
          )

          if (!isValidPassword) {
            return null
          }

          // Clean up expired sessions for this user
          await database
            .delete(sessions)
            .where(
              and(
                eq(sessions.userId, userWithPreferences.users.id),
                lt(sessions.expires, new Date())
              )
            )

          return {
            id: userWithPreferences.users.id,
            name: userWithPreferences.users.name,
            email: userWithPreferences.users.email,
            role: userWithPreferences.users.role,
            image: userWithPreferences.users.image,
            emailVerified: userWithPreferences.users.emailVerified,
            theme: userWithPreferences.user_preferences?.theme ?? 'system',
            isTwoFactorEnabled: userWithPreferences.users.isTwoFactorEnabled
          } as User
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
