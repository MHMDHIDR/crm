'use server'

import { eq } from 'drizzle-orm'
import { database } from '@/db'
import { VerificationToken } from '@/db/schema'

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await database.query.VerificationToken.findFirst({
      where: eq(VerificationToken.token, token)
    })

    return verificationToken
  } catch {
    return null
  }
}

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await database.query.VerificationToken.findFirst({
      where: eq(VerificationToken.email, email)
    })

    return verificationToken
  } catch {
    return null
  }
}
