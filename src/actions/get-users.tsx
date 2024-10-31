'use server'

import { database } from '@/db'
import type { User } from '@/db/schema'

/**
 * Fetch all users from the database
 * @returns    Promise<{ success: boolean; data?: User[]; error?: string }>
 */
export async function getUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
  try {
    const allUsers = await database.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.emailVerified)]
    })

    return { success: true, data: allUsers }
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' }
  }
}
