'use server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import * as z from 'zod'
import { getPasswordResetTokenByToken } from '@/actions/auth/password-reset-token'
import { getUserByEmail } from '@/actions/users/get-users'
import { database } from '@/db'
import { PasswordResetToken, users } from '@/db/schema'
import { userSchema } from '@/validators/user'

// Create new password schema with optional 2FA code
const newPasswordSchema = userSchema
  .pick({ password: true })
  .extend({ confirmPassword: z.string(), token: z.string() })

type newPasswordData = z.infer<typeof newPasswordSchema>

type newPasswordonResult = Promise<{ success: boolean; message: string }>

export async function newPassword(values: newPasswordData): newPasswordonResult {
  if (!values.token) {
    return { success: false, message: 'Missing token!' }
  }

  const validatedFields = newPasswordSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid fields!' }
  }

  const { password } = validatedFields.data

  const existingToken = await getPasswordResetTokenByToken(values.token)

  if (!existingToken) {
    return { success: false, message: 'Invalid token!' }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) {
    return { success: false, message: 'Token has expired!' }
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if (!existingUser) {
    return { success: false, message: 'Email does not exist!' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const [_updatedUser] = await database
    .update(users)
    .set({ hashedPassword })
    .where(eq(users.id, existingUser.id))
    .returning()

  // Delete used token
  await database.delete(PasswordResetToken).where(eq(PasswordResetToken.id, existingToken.id))

  return { success: true, message: 'Password updated!' }
}
