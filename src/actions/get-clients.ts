'use server'

import { database } from '@/db'
import type { Client } from '@/db/schema'

/**
 * Fetch all clients from the database
 * @returns    Promise<{ success: boolean; data?: Client[]; error?: string }>
 */
export async function getClients(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
  try {
    const allClients = await database.query.clients.findMany({
      orderBy: (clients, { desc }) => [desc(clients.email)]
    })

    return { success: true, data: allClients }
  } catch (error) {
    return { success: false, error: 'Failed to fetch clients' }
  }
}
