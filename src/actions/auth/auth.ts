'use server'

import { eq } from 'drizzle-orm'
import { AuthError } from 'next-auth'
import { getTwoFactorConfirmationByUserId } from '@/actions/auth/two-factor-confirmation'
import { getTwoFactorTokenByEmail } from '@/actions/auth/two-factor-token'
import { getUserByEmail } from '@/actions/users/get-users'
import { signIn } from '@/auth'
import { database } from '@/db'
import { twoFactorConfirmations, TwoFactorToken } from '@/db/schema'
import { sendTwoFactorTokenEmail } from '@/lib/mail'
import { generateTwoFactorToken } from '@/lib/tokens'
import { userSchema } from '@/validators/user'

type AuthResult = { success: boolean; message: string; twoFactor?: boolean }

export async function authenticate(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const code = formData.get('code') as string | null

  const signInSchema = userSchema.pick({ email: true, password: true })

  const validatedFields = signInSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid email or password' }
  }

  try {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      return { success: false, message: 'Invalid email or password' }
    }

    if (existingUser.isTwoFactorEnabled) {
      if (code) {
        // Verify 2FA code
        const twoFactorTokenRecord = await getTwoFactorTokenByEmail(email)

        if (!twoFactorTokenRecord || twoFactorTokenRecord.token !== code) {
          return { success: false, message: 'Invalid two-factor code' }
        }

        if (new Date(twoFactorTokenRecord.expires) < new Date()) {
          return { success: false, message: 'Two-factor code has expired' }
        }

        // Delete used token
        await database.delete(TwoFactorToken).where(eq(TwoFactorToken.id, twoFactorTokenRecord.id))

        // Delete existing confirmation if any
        const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
        if (existingConfirmation) {
          await database
            .delete(twoFactorConfirmations)
            .where(eq(twoFactorConfirmations.id, existingConfirmation.id))
        }

        // Create new confirmation
        await database
          .insert(twoFactorConfirmations)
          .values({ userId: existingUser.id })
          .returning()
      } else {
        // Generate and send new 2FA code
        const twoFactorToken = await generateTwoFactorToken(email)
        await sendTwoFactorTokenEmail(email, twoFactorToken.token)

        return { success: false, message: 'Two-factor code sent to your email', twoFactor: true }
      }
    }

    await signIn('credentials', { email, password, redirect: false })

    return { success: true, message: 'Successfully signed in' }
  } catch (error) {
    console.error('Authentication error:', error)

    if (error instanceof AuthError) {
      return { success: false, message: 'Invalid credentials' }
    }

    return { success: false, message: 'An error occurred during authentication' }
  }
}
