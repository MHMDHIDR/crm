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

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const session = await auth()

  if (!session || !session.user) {
    return { error: 'Unauthorized' }
  }

  const user = session.user

  const dbUser = await getUserById(user.id)

  if (!dbUser) {
    return { error: 'Unauthorized' }
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email)

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email already in use!' }
    }

    const verificationToken = await generateVerificationToken(values.email)
    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return { success: 'Verification email sent!' }
  }

  const plainPassword = values.password as string

  // Verify password
  if (values.password && values.newPassword && dbUser.hashedPassword) {
    const isValidPassword = compareHashedStrings(plainPassword, dbUser.hashedPassword)

    if (!isValidPassword) {
      return { error: 'Incorrect password!' }
    }

    values.password = hashedString(values.newPassword)
    values.newPassword = undefined
  }

  const [updatedUser] = await database
    .update(users)
    .set({ ...values })
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
