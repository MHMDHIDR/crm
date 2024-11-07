'use server'

import { auth } from '@/auth'
import { database } from '@/db'
import { Task, tasks } from '@/db/schema'
import { taskSchema } from '@/validators/task'
import type { z } from 'zod'

type CreateTaskResult = { success: boolean; message: string }

export async function createTask(
  data: z.infer<typeof taskSchema> & { projectId: string }
): Promise<CreateTaskResult> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const [newTask]: Task[] = await database
      .insert(tasks)
      .values({
        ...data,
        projectId: data.projectId,
        assignedEmployeeId: session.user.id
      })
      .returning()

    if (!newTask) {
      return { success: false, message: 'Failed to create task' }
    }

    return {
      success: true,
      message: `${newTask.title} has been created successfully 🎉.`
    }
  } catch (error) {
    console.error('Task creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create task. Please try again.'
    }
  }
}
