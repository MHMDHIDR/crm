import { eq } from 'drizzle-orm'
import { database } from '@/db'
import { PasswordResetToken } from '@/db/schema'

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await database.query.PasswordResetToken.findFirst({
      where: eq(PasswordResetToken.token, token)
    })

    return passwordResetToken
  } catch {
    return null
  }
}

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await database.query.PasswordResetToken.findFirst({
      where: eq(PasswordResetToken.email, email)
    })

    return passwordResetToken
  } catch {
    return null
  }
}
