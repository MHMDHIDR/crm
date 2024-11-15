'use server'

import { inArray } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
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
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate input
    if (!userIds.length) {
      return {
        success: false,
        message: actionsTranslations('noUsersSelected')
      }
    }

    // Delete users from the database
    const deletedUsers = await database.delete(users).where(inArray(users.id, userIds)).returning()

    if (!deletedUsers.length) {
      return {
        success: false,
        message: actionsTranslations('failedDeleteUsers')
      }
    }

    // Create event entries for all deleted users
    const eventPromises = deletedUsers.map(user =>
      addEvent(
        actionsTranslations('eventUserDeleted', {
          userName: user.name,
          userEmail: user.email
        })
      )
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)

    // Check if any events failed to be added
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
      return {
        success: true,
        message: actionsTranslations('someEventsFailedWarning')
      }
    }

    return {
      success: true,
      message: actionsTranslations('usersDeletedSuccessfully')
    }
  } catch (error) {
    console.error('Error deleting users:', error)
    return {
      success: false,
      message: actionsTranslations('failedDeleteUsers')
    }
  }
}
