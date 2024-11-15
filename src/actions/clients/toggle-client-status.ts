'use server'

import { inArray } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { Client, clients } from '@/db/schema'

type ClientStatus = 'active' | 'deactivated'

/**
 * Toggle status of one or multiple clients in the database
 * @param clientIds - Array of client IDs to toggle
 * @param status - Status to set ('active' or 'deactivated')
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function toggleClientStatus(
  clientIds: string[],
  status: ClientStatus
): Promise<{ success: boolean; message?: string }> {
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate input
    if (!clientIds.length) {
      return {
        success: false,
        message: actionsTranslations('noClientsSelectedForStatus', {
          status: status === 'active' ? 'activation' : 'deactivation'
        })
      }
    }

    // Update clients' status and updatedAt field
    const toggledClients: Client[] = await database
      .update(clients)
      .set({ status, updatedAt: new Date() })
      .where(inArray(clients.id, clientIds))
      .returning()

    // Check if we got any results
    if (!toggledClients.length) {
      return {
        success: false,
        message: actionsTranslations('failedActivateClients', { status })
      }
    }

    // Create event entries for all updated clients
    const eventPromises = toggledClients.map(client =>
      addEvent(actionsTranslations('activatedClient', { clientName: client.name, status }))
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added, Add event for the status change
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
    }

    return {
      success: true,
      message: actionsTranslations('clientsStatusChanged', { count: toggledClients.length, status })
    }
  } catch (error) {
    console.error(`Error ${status === 'active' ? 'activating' : 'deactivating'} clients:`, error)
    return { success: false, message: actionsTranslations('failedAction') }
  }
}
