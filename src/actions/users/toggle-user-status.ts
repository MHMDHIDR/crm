'use server'

import { inArray } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { users } from '@/db/schema'
import type { User } from '@/db/schema'

type UserStatus = 'suspend' | 'unsuspend'

/**
 * Toggle suspension status of one or multiple users in the database
 * @param userIds - Array of user IDs to toggle
 * @param status - Status to set ('suspend' or 'unsuspend')
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function toggleUserStatus(
  userIds: string[],
  status: UserStatus
): Promise<{ success: boolean; message?: string }> {
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate input
    if (!userIds.length) {
      return {
        success: false,
        message: actionsTranslations('noUsersSelectedForStatus', { status })
      }
    }

    // Update users' suspendedAt field based on status
    const toggledUser: User[] = await database
      .update(users)
      .set({ suspendedAt: status === 'suspend' ? new Date() : null })
      .where(inArray(users.id, userIds))
      .returning()

    if (!toggledUser.length) {
      return {
        success: false,
        message: actionsTranslations('failedToggleUsers', { status })
      }
    }

    // Create event entries for all updated projects
    const eventPromises = toggledUser.map(user =>
      addEvent(`${user.name} ${status === 'suspend' ? 'Suspended' : 'Unsuspended'}!`)
    )
    // Wait for all events to be added, Add event for the status change
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
    }

    return {
      success: true,
      message: actionsTranslations('usersStatusChanged', { status })
    }
  } catch (error) {
    console.error(`Error ${status === 'suspend' ? 'suspending' : 'unsuspending'} users:`, error)
    return {
      success: false,
      message: actionsTranslations('failedToggleUsers', { status })
    }
  }
}
