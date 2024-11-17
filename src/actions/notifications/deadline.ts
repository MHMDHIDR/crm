'use server'

import { and, eq, sql } from 'drizzle-orm'
import { database } from '@/db'
import { notifications, projects, tasks } from '@/db/schema'

export async function checkUserDeadlines(userId: string, daysCountFromNow: number = 3) {
  // Convert JavaScript Date to SQL timestamp string
  const daysFromNow = new Date()
  daysFromNow.setDate(daysFromNow.getDate() + daysCountFromNow)
  const daysFromNowSQL = daysFromNow.toISOString()
  const nowSQL = new Date().toISOString()

  // Check projects
  const upcomingProjects = await database
    .select({ id: projects.id, name: projects.name, endDate: projects.endDate })
    .from(projects)
    .where(
      and(
        eq(projects.assignedEmployeeId, userId),
        eq(projects.status, 'active'),
        sql`${projects.endDate}::timestamp <= ${daysFromNowSQL}::timestamp`,
        sql`${projects.endDate}::timestamp > ${nowSQL}::timestamp`
      )
    )

  // Check tasks - now including projectId in the select
  const upcomingTasks = await database
    .select({
      id: tasks.id,
      title: tasks.title,
      dueDate: tasks.dueDate,
      projectId: tasks.projectId
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.assignedEmployeeId, userId),
        eq(tasks.status, 'pending'),
        sql`${tasks.dueDate}::timestamp <= ${daysFromNowSQL}::timestamp`,
        sql`${tasks.dueDate}::timestamp > ${nowSQL}::timestamp`
      )
    )

  // Create notifications for projects
  for (const project of upcomingProjects) {
    // Check if notification already exists
    const existingNotification = await database
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.referenceId, project.id),
          eq(notifications.type, 'project_deadline'),
          eq(notifications.userId, userId)
        )
      )
      .limit(1)

    if (existingNotification.length === 0) {
      const daysLeft = Math.ceil(
        (project.endDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      await database.insert(notifications).values({
        userId,
        type: 'project_deadline',
        title: 'Project Deadline Alert',
        message: `Project "${project.name}" is due in ${daysLeft} days`,
        referenceId: project.id,
        createdAt: new Date()
      })
    }
  }

  // Create notifications for tasks - now using projectId as referenceId
  for (const task of upcomingTasks) {
    const existingNotification = await database
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.referenceId, task.projectId),
          eq(notifications.type, 'task_deadline'),
          eq(notifications.userId, userId)
        )
      )
      .limit(1)

    if (existingNotification.length === 0) {
      const daysLeft = Math.ceil(
        (task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      await database.insert(notifications).values({
        userId,
        type: 'task_deadline',
        title: 'Task Deadline Alert',
        message: `Task "${task.title}" is due in ${daysLeft} days`,
        referenceId: task.projectId, // Changed from task.id to task.projectId
        createdAt: new Date()
      })
    }
  }
}
