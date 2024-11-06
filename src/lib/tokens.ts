import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { getPasswordResetTokenByEmail } from '@/actions/auth/password-reset-token'
import { getTwoFactorTokenByEmail } from '@/actions/auth/two-factor-token'
import { getVerificationTokenByEmail } from '@/actions/auth/verificiation-token'
import { database } from '@/db'
import { PasswordResetToken, TwoFactorToken, VerificationToken } from '@/db/schema'

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomUUID() // bcrypt.hashSync(email, 10)
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getVerificationTokenByEmail(email)

  if (existingToken) {
    await database.delete(VerificationToken).where(eq(VerificationToken.id, existingToken.id))
  }

  const [verficationToken] = await database
    .insert(VerificationToken)
    .values({ email, token, expires })
    .returning()

  return verficationToken
}

export const generatePasswordResetToken = async (email: string) => {
  const token = crypto.randomUUID() // bcrypt.hashSync(email, 10)
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getPasswordResetTokenByEmail(email)

  if (existingToken) {
    await database.delete(PasswordResetToken).where(eq(PasswordResetToken.id, existingToken.id))
  }

  const [passwordResetToken] = await database
    .insert(PasswordResetToken)
    .values({ email, token, expires })
    .returning()

  return passwordResetToken
}

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString() // bcrypt.hashSync(email, 10)
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getTwoFactorTokenByEmail(email)

  if (existingToken) {
    await database.delete(TwoFactorToken).where(eq(TwoFactorToken.id, existingToken.id))
  }

  const [twoFactorToken] = await database
    .insert(TwoFactorToken)
    .values({ email, token, expires })
    .returning()

  return twoFactorToken
}
