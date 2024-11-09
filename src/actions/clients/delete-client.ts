'use server'

import { inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { clients } from '@/db/schema'

/**
 * Delete one or multiple clients from the database
 * @param userIds - Array of user IDs to delete
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deleteClients(
  userIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!userIds.length) {
      return { success: false, message: 'No clients selected for deletion!' }
    }

    // Delete clients from the database
    const deletedClients = await database.delete(clients).where(inArray(clients.id, userIds))
    const addedEvent = await addEvent(`Deleted ${deletedClients.length} Clients.`)

    if (!deletedClients || !addedEvent.success) {
      return {
        success: false,
        message: 'Failed to delete clients. Please try again.'
      }
    }

    return { success: true, message: 'Clients deleted successfully' }
  } catch (error) {
    console.error('Error deleting clients:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete client. Please try again.'
    }
  }
}
