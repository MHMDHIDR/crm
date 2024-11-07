'use server'

import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { database } from '@/db'
import { tasks } from '@/db/schema'
import type { Project, Task, TaskWithRelations } from '@/db/schema'

/**
 * Fetch tasks for a specific project
 * @param projectId The ID of the project to fetch tasks for
 * @returns Promise<{ success: boolean; data?: TaskWithRelations[]; error?: string }>
 */
export async function getTasks(projectId: Project['id']): Promise<{
  success: boolean
  data?: TaskWithRelations[]
  error?: string
}> {
  try {
    const session = await auth()
    if (!session) {
      return { success: false, error: 'You must be logged in to fetch tasks' }
    }

    const role = session.user.role

    let tasksWithRelations: TaskWithRelations[] = []

    if (role === 'Admin') {
      tasksWithRelations = await database.query.tasks.findMany({
        with: {
          project: { with: { assignedEmployee: true, client: true } },
          assignedEmployee: true
        },
        where: eq(tasks.projectId, projectId)
      })
    } else {
      tasksWithRelations = await database.query.tasks.findMany({
        with: {
          project: { with: { assignedEmployee: true, client: true } },
          assignedEmployee: true
        },
        where: and(eq(tasks.projectId, projectId), eq(tasks.assignedEmployeeId, session.user.id))
      })
    }

    return { success: true, data: tasksWithRelations }
  } catch (error) {
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

/**
 * Fetch a single task by ID from the database
 * @param taskId The ID of the task to fetch
 * @returns Promise<{ success: boolean; data?: TaskWithRelations; error?: string }>
 */
export async function getTaskById(
  taskId: Task['id']
): Promise<{ success: boolean; data?: TaskWithRelations; error?: string }> {
  try {
    const taskWithRelations = await database.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        project: { with: { assignedEmployee: true, client: true } },
        assignedEmployee: true
      }
    })

    if (!taskWithRelations) {
      return { success: false, error: 'Task not found' }
    }

    return { success: true, data: taskWithRelations }
  } catch (error) {
    return { success: false, error: 'Failed to fetch task' }
  }
}

/**
 * Fetch tasks for a specific employee
 * @param employeeId ID of the employee to fetch tasks for
 * @returns Promise<TaskWithRelations[] | null>
 */
export async function getTasksByEmployeeId(
  employeeId: Task['assignedEmployeeId']
): Promise<TaskWithRelations[] | null> {
  try {
    if (!employeeId) return null

    const tasksWithRelations = await database.query.tasks.findMany({
      where: eq(tasks.assignedEmployeeId, employeeId),
      with: {
        project: { with: { assignedEmployee: true, client: true } },
        assignedEmployee: true
      }
    })

    return tasksWithRelations
  } catch {
    return null
  }
}
