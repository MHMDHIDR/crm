'use server'

import { eq } from 'drizzle-orm'
import { database } from '@/db'
import { TwoFactorToken } from '@/db/schema'

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await database.query.TwoFactorToken.findFirst({
      where: eq(TwoFactorToken.token, token)
    })

    return twoFactorToken
  } catch {
    return null
  }
}

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await database.query.TwoFactorToken.findFirst({
      where: eq(TwoFactorToken.email, email)
    })

    return twoFactorToken
  } catch {
    return null
  }
}
