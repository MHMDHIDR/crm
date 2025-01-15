'use server'

import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { tasks, users } from '@/db/schema'
import type { Project, Task, TasksByStatus, User } from '@/db/schema'

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
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch tasks' }
    }

    let allTasks: Task[] = []

    allTasks = await database.query.tasks.findMany({
      where: and(eq(tasks.projectId, projectId), eq(tasks.assignedEmployeeId, session.user.id))
    })

    return { success: true, data: allTasks }
  } catch (error) {
    return { success: false, error: 'Failed to fetch tasks' }
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
  try {
    const session = await auth()
    const user = session?.user
    if (!user) {
      return { success: false, error: 'You must be logged in to view tasks' }
    }

    let allTasks: Task[] = []

    // If user is Admin, they can see all tasks in the project
    if (user.role === 'Admin') {
      allTasks = await database.query.tasks.findMany({
        where: eq(tasks.projectId, projectId)
      })
    } else {
      // First get the tasks where the user is directly assigned
      const directTasks = await database.query.tasks.findMany({
        where: and(eq(tasks.projectId, projectId), eq(tasks.assignedEmployeeId, user.id))
      })

      // Then get tasks where the user is the supervisor of the assigned employee
      const supervisedEmployeeTasks = await database
        .select()
        .from(tasks)
        .innerJoin(users, eq(tasks.assignedEmployeeId, users.id))
        .where(and(eq(tasks.projectId, projectId), eq(users.supervisorId, user.id)))

      // Combine both sets of tasks
      allTasks = [...directTasks, ...supervisedEmployeeTasks.map(row => row.tasks)]
    }

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
    return { success: false, error: 'Failed to fetch tasks' }
  }
}
