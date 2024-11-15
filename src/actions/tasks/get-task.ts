'use server'

import { and, eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { database } from '@/db'
import { tasks } from '@/db/schema'
import type { Project, Task, TasksByStatus } from '@/db/schema'

/**
 * Fetch tasks for a specific project
 * @param projectId The ID of the project to fetch tasks for
 * @returns Promise<{ success: boolean; data?: Task[]; error?: string }>
 */
export async function getTasks({ projectId }: { projectId: Project['id'] }): Promise<{
  success: boolean
  data?: Task[]
  error?: string
}> {
  const actionsTranslations = await getTranslations('actions')

  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: actionsTranslations('unauthorized') }
    }

    let allTasks: Task[] = []

    allTasks = await database.query.tasks.findMany({
      where: and(eq(tasks.projectId, projectId), eq(tasks.assignedEmployeeId, session.user.id))
    })

    return { success: true, data: allTasks }
  } catch (error) {
    return { success: false, error: actionsTranslations('failedFetch') }
  }
}

/**
 * Fetch tasks for a specific project, categorized by status
 * @param projectId The ID of the project to fetch tasks for
 * @returns Promise<{ success: boolean; data?: TasksByStatus; error?: string }>
 */
export async function getTasksByStatus({ projectId }: { projectId: Project['id'] }): Promise<{
  success: boolean
  data?: TasksByStatus
  error?: string
}> {
  const actionsTranslations = await getTranslations('actions')

  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: actionsTranslations('unauthorized') }
    }

    const allTasks = await database.query.tasks.findMany({
      where: and(eq(tasks.projectId, projectId), eq(tasks.assignedEmployeeId, session.user.id))
    })

    // Categorize tasks by status
    const tasksByStatus: TasksByStatus = {
      pending: [],
      'in-progress': [],
      completed: []
    }

    for (const task of allTasks) {
      if (task.status === 'pending') {
        tasksByStatus.pending.push(task)
      } else if (task.status === 'in-progress') {
        tasksByStatus['in-progress'].push(task)
      } else if (task.status === 'completed') {
        tasksByStatus.completed.push(task)
      }
    }

    return { success: true, data: tasksByStatus }
  } catch (error) {
    return { success: false, error: actionsTranslations('failedFetch') }
  }
}
