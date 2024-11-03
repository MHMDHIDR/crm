import { eq } from 'drizzle-orm'
import { database } from '@/db/index'
import { users } from '@/db/schema'
import type { User } from '@/db/schema'

/**
 * Fetch a single user by email from the database
 * @param email   Email address of the user
 * @returns        Promise<User | null>
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await database.query.users.findFirst({ where: eq(users.email, email) })

    return user || null
  } catch {
    return null
  }
}

/**
 * Fetch a single user by ID from the database
 * @returns    Promise<{ success: boolean; data?: User[]; error?: string }>
 */
export async function getUserById(
  userId: User['id']
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const user = await database.query.users.findFirst({
      where: eq(users.id, userId)
    })

    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' }
  }
}
