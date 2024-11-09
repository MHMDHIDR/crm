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
    const deletedClients = await database
      .delete(clients)
      .where(inArray(clients.id, userIds))
      .returning()

    if (!deletedClients.length) {
      return { success: false, message: 'Failed to delete clients. Please try again.' }
    }

    // Create event entries for all updated projects
    const eventPromises = deletedClients.map(client =>
      addEvent(`Deleted ${client.name} [${client.email}] from the Records!`)
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
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
