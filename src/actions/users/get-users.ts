'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { users } from '@/db/schema'
import type { User } from '@/db/schema'

/**
 * Fetch all users from the database except the current authorized admin
 * @returns    Promise<{ success: boolean; data?: User[]; error?: string }>
 */
export async function getUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  const session = await auth()
  if (!session || !session.user || session.user.role !== 'Admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const authorizedAdmin = session.user

  try {
    const allUsers = await database.query.users.findMany({
      where: (users, { ne }) => ne(users.id, authorizedAdmin.id),
      orderBy: (users, { desc }) => [desc(users.emailVerified)]
    })

    return { success: true, data: allUsers }
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' }
  }
}

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
