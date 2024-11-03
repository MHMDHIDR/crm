'use server'

import { auth } from '@/auth'
import { database } from '@/db'
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
