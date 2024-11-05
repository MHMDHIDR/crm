'use server'

import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { clients } from '@/db/schema'
import type { Client } from '@/db/schema'

/**
 * Fetch all clients from the database
 * @returns    Promise<{ success: boolean; data?: Client[]; error?: string }>
 */
export async function getClients(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch clients' }
    }

    const role = session.user.role

    let allClients: Client[] = []

    if (role === 'Admin') {
      allClients = await database.query.clients.findMany({
        orderBy: (clients, { desc }) => [desc(clients.email)]
      })
    } else {
      allClients = await database.query.clients.findMany({
        orderBy: (clients, { desc }) => [desc(clients.email)],
        where: eq(clients.assignedEmployeeId, session.user.id)
      })
    }

    return { success: true, data: allClients }
  } catch (error) {
    return { success: false, error: 'Failed to fetch clients' }
  }
}
