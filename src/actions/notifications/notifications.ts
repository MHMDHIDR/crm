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

export async function checkAndCreateDeadlineNotifications(): Promise<void> {
  try {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    // Check projects nearing deadline
    const upcomingProjects = await database
      .select({
        id: projects.id,
        name: projects.name,
        endDate: projects.endDate,
        assignedEmployeeId: projects.assignedEmployeeId
      })
      .from(projects)
      .where(
        and(
          sql`${projects.endDate} <= ${threeDaysFromNow}`,
          sql`${projects.endDate} > NOW()`,
          eq(projects.status, 'active')
        )
      )

    // Create notifications for upcoming project deadlines
    for (const project of upcomingProjects) {
      const existingNotification = await database
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.referenceId, project.id),
            eq(notifications.type, 'project_deadline'),
            eq(notifications.userId, project.assignedEmployeeId)
          )
        )
        .limit(1)

      if (existingNotification.length === 0) {
        await database.insert(notifications).values({
          userId: project.assignedEmployeeId,
          type: 'project_deadline',
          title: 'Upcoming Project Deadline',
          message: `Project "${project.name}" is due in ${Math.ceil(
            (project.endDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )} days`,
          referenceId: project.id
        })
      }
    }

    // Check tasks nearing deadline
    const upcomingTasks = await database
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        assignedEmployeeId: tasks.assignedEmployeeId
      })
      .from(tasks)
      .where(
        and(
          sql`${tasks.dueDate} <= ${threeDaysFromNow}`,
          sql`${tasks.dueDate} > NOW()`,
          eq(tasks.status, 'pending')
        )
      )

    // Create notifications for upcoming task deadlines
    for (const task of upcomingTasks) {
      const existingNotification = await database
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.referenceId, task.id),
            eq(notifications.type, 'task_deadline'),
            eq(notifications.userId, task.assignedEmployeeId)
          )
        )
        .limit(1)

      if (existingNotification.length === 0) {
        await database.insert(notifications).values({
          userId: task.assignedEmployeeId,
          type: 'task_deadline',
          title: 'Upcoming Task Deadline',
          message: `Task "${task.title}" is due in ${Math.ceil(
            (task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )} days`,
          referenceId: task.id
        })
      }
    }
  } catch (error) {
    console.error('Error checking deadlines:', error)
  }
}
