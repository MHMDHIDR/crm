'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { database } from '@/db'
import { notifications, projects, tasks } from '@/db/schema'
import type { Notification, UserSession } from '@/db/schema'

export async function getUnreadNotificationsCount(): Promise<{
  success: boolean
  count: number
  error?: string
}> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'Unauthorized', count: 0 }
    }

    const [result] = await database
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)))

    return { success: true, count: result.count }
  } catch (error) {
    return { success: false, error: 'Failed to fetch notifications count', count: 0 }
  }
}

export async function getUserNotificationsByUserId({
  userId
}: {
  userId: UserSession['id']
}): Promise<{
  success: boolean
  data: Notification[]
  message?: string
}> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, message: 'Unauthorized', data: [] }
    }

    const userNotifications = await database
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`)

    return { success: true, data: userNotifications }
  } catch (error) {
    return { success: false, message: 'Failed to fetch notifications', data: [] }
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    await database
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)))

    revalidatePath('/dashboard/notifications')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to mark notification as read' }
  }
}
