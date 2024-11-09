'use server'

import { inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { users } from '@/db/schema'

/**
 * Suspend one or multiple users in the database
 * @param userIds - Array of user IDs to suspend
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function suspendUsers(
  userIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!userIds.length) {
      return { success: false, message: 'No Users Selected For Suspension! Please Select users.' }
    }

    // Update users' suspendedAt field with current timestamp using new Date()
    const [toggledUsersStatus] = await database
      .update(users)
      .set({ suspendedAt: new Date() })
      .where(inArray(users.id, userIds))
    const addedEvent = await addEvent(`Suspended ${toggledUsersStatus} users`)

    if (!toggledUsersStatus || !addedEvent.success) {
      return { success: false, message: 'Failed to suspend users' }
    }

    return { success: true, message: 'Users suspended successfully' }
  } catch (error) {
    console.error('Error suspending users:', error)
    return { success: false, message: 'Failed to suspend users. Please try again.' }
  }
}

/**
 * Unsuspend one or multiple users in the database
 * @param userIds - Array of user IDs to unsuspend
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function unsuspendUsers(
  userIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!userIds.length) {
      return { success: false, message: 'No Users Selected For Unsuspension! Please Select users.' }
    }

    // Set suspendedAt to null to unsuspend users
    const [toggledUsersStatus] = await database
      .update(users)
      .set({ suspendedAt: null })
      .where(inArray(users.id, userIds))
    const addedEvent = await addEvent(`Unsuspended ${toggledUsersStatus} users`)

    if (!toggledUsersStatus || !addedEvent.success) {
      return { success: false, message: 'Failed to unsuspend users' }
    }

    return { success: true, message: 'Users unsuspended successfully' }
  } catch (error) {
    console.error('Error unsuspending users:', error)
    return { success: false, message: 'Failed to unsuspend users. Please try again.' }
  }
}
