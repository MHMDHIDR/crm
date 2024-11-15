'use server'

import { inArray } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
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
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate input
    if (!userIds.length) {
      return { success: false, message: actionsTranslations('noClientsSelected') }
    }

    // Delete clients from the database
    const deletedClients = await database
      .delete(clients)
      .where(inArray(clients.id, userIds))
      .returning()

    if (!deletedClients.length) {
      return { success: false, message: actionsTranslations('failedAction') }
    }

    // Create event entries for all updated projects
    const eventPromises = deletedClients.map(client =>
      addEvent(
        actionsTranslations('eventClientDeleted', {
          clientName: client.name,
          clientEmail: client.email
        })
      )
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
    }

    return { success: true, message: actionsTranslations('clientsDeleted') }
  } catch (error) {
    console.error('Error deleting clients:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedAction')
    }
  }
}
