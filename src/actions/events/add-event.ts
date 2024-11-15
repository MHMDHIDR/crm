'use server'

import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { database } from '@/db'
import { Event, events, UserRole } from '@/db/schema'

type EventOptions = {
  skipAuth?: boolean
  userId?: string
  userName?: string
  userRole?: (typeof UserRole)[keyof typeof UserRole]
}

/**
 * Server action to track user events
 * @param description The description of the event
 * @param options Optional parameters for auth bypass and user details
 * @returns Object with success status and message
 */
export async function addEvent(description: string, options: EventOptions = {}) {
  const actionsTranslations = await getTranslations('actions')

  const { skipAuth = false, userId, userName, userRole } = options

  // If not skipping auth, get the current session
  let user = null
  if (!skipAuth) {
    const session = await auth()
    if (!session?.user) {
      return { success: false, message: actionsTranslations('unauthorized'), event: null }
    }
    user = session.user
  }

  try {
    const [event]: Event[] = await database
      .insert(events)
      .values({
        description,
        userName: userName || user?.name || 'Unknown',
        userId: userId || user?.id || null,
        userRole: userRole || user?.role || 'Employee',
        timestamp: new Date()
      })
      .returning()

    return {
      success: true,
      message: 'Event tracked successfully',
      event
    }
  } catch (error) {
    console.error('Event tracking error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to track event',
      event: null
    }
  }
}
