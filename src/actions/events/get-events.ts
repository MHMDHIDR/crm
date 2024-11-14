'use server'

import { auth } from '@/auth'
import { database } from '@/db'
import type { Event } from '@/db/schema'

/**
 * Fetch all events from the database
 * @returns    Promise<{ success: boolean; data?: Event[]; error?: string }>
 */
export async function getEvents(): Promise<{ success: boolean; data?: Event[]; error?: string }> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch events' }
    }

    const role = session.user.role

    if (role !== 'Admin') {
      return { success: false, error: 'You must be an admin to fetch events' }
    }

    const allEvents: Event[] = await database.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.timestamp)]
    })

    return { success: true, data: allEvents }
  } catch (error) {
    return { success: false, error: 'Failed to fetch events' }
  }
}
