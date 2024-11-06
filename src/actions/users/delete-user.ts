'use server'

import { inArray } from 'drizzle-orm'
import { database } from '@/db'
import { users } from '@/db/schema'

/**
 * Delete one or multiple users from the database
 * @param userIds - Array of user IDs to delete
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deleteUsers(
  userIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!userIds.length) {
      return { success: false, message: 'No users selected for deletion' }
    }

    // Delete users from the database
    await database.delete(users).where(inArray(users.id, userIds))

    return { success: true, message: 'Users deleted successfully' }
  } catch (error) {
    console.error('Error deleting users:', error)
    return {
      success: false,
      message: 'Failed to delete users. Please try again.'
    }
  }
}
