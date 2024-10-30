import { eq } from 'drizzle-orm'
import { database } from '@/db'
import { twoFactorConfirmations } from '@/db/schema'

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    const twoFactorConfirmation = await database.query.twoFactorConfirmations.findFirst({
      where: eq(twoFactorConfirmations.userId, userId)
    })

    return twoFactorConfirmation
  } catch {
    return null
  }
}
