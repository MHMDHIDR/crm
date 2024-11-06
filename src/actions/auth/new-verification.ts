'use server'

import { eq } from 'drizzle-orm'
import { getVerificationTokenByToken } from '@/actions/auth//verificiation-token'
import { getUserByEmail } from '@/actions/users/get-users'
import { database } from '@/db'
import { users, VerificationToken } from '@/db/schema'

type newVerificationResult = Promise<{ success: string } | { error: string; status: number }>

/**
 * Verify the email of the user by the token
 *
 * @param token   The token to verify the email
 * @returns      Promise<{ success: string } | { error: string, status: number }>
 */
export async function newVerification(token: string): newVerificationResult {
  const existingToken = await getVerificationTokenByToken(token)
  if (!existingToken) {
    return { error: 'Token does not exist!', status: 404 }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) {
    return { error: 'Token has expired!', status: 401 }
  }

  const existingUser = await getUserByEmail(existingToken.email)
  if (!existingUser) {
    return { error: 'Email does not exist!', status: 404 }
  }

  // const [updatedUser] =
  await database
    .update(users)
    .set({ emailVerified: new Date(), email: existingToken.email })
    .where(eq(users.id, existingUser.id))
  // .returning()

  // Delete the verification token
  await database.delete(VerificationToken).where(eq(VerificationToken.id, existingToken.id))

  return { success: 'Email verified Successfully!', status: 200 }
}
