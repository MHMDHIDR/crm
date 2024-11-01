'use server'

import { eq } from 'drizzle-orm'
import * as z from 'zod'
import { auth, update } from '@/auth'
import { database } from '@/db'
import { users } from '@/db/schema'
import { compareHashedStrings, hashedString } from '@/lib/crypt'
import { sendVerificationEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/tokens'
import { getUserByEmail, getUserById } from '@/services/user'
import { SettingsSchema } from '@/validators/settings'

interface ExtendedSettingsInput extends z.infer<typeof SettingsSchema> {
  is2FAToggled: boolean
}

export const settings = async (values: ExtendedSettingsInput) => {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const dbUser = await getUserById(session.user.id)

  if (!dbUser) {
    return { error: 'Unauthorized' }
  }

  // Handle email change
  if (values.email && values.email !== session.user.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser && existingUser.id !== session.user.id) {
      return { error: 'Email already in use!' }
    }

    const verificationToken = await generateVerificationToken(values.email)
    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return { success: 'Verification email sent!' }
  }

  // Handle password verification for 2FA toggle
  if (values.is2FAToggled) {
    if (!values.password || !dbUser.hashedPassword) {
      return { error: 'Password is required to change 2FA settings' }
    }

    const isValidPassword = compareHashedStrings(values.password, dbUser.hashedPassword)
    if (!isValidPassword) {
      return { error: 'Incorrect password!' }
    }
  }

  // Handle password change (when not toggling 2FA)
  if (values.password && !values.is2FAToggled) {
    if (dbUser.hashedPassword) {
      // Verify new password is different from current
      const isSamePassword = compareHashedStrings(values.password, dbUser.hashedPassword)
      if (isSamePassword) {
        return { error: 'New password must be different from current password' }
      }
    }
    values.password = hashedString(values.password)
  }

  // Clear password from values if it was only used for 2FA verification
  if (values.is2FAToggled && !values.password?.startsWith('$2')) {
    values.password = undefined
  }

  const [updatedUser] = await database
    .update(users)
    .set({
      name: values.name,
      email: values.email,
      hashedPassword: values.password,
      role: values.role,
      isTwoFactorEnabled: values.isTwoFactorEnabled
    })
    .where(eq(users.id, dbUser.id))
    .returning()

  if (!updatedUser) {
    return { error: 'Failed to update settings' }
  }

  update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role ?? undefined
    }
  })

  return { success: 'Settings Updated!' }
}
