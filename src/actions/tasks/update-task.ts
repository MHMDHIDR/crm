'use server'

import { eq } from 'drizzle-orm'
import { database } from '@/db'
import { tasks } from '@/db/schema'

interface UpdateTaskStatusParams {
  taskId: string
  status: 'pending' | 'in-progress' | 'completed'
}

export async function updateTaskStatus({ taskId, status }: UpdateTaskStatusParams) {
  try {
    const [updatedTask] = await database
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, taskId))
      .returning()

    return {
      success: true,
      message: `Task ${updatedTask.title} status updated successfully`
    }
  } catch (error) {
    console.error('Error updating task status:', error)
    return {
      success: false,
      message: 'Failed to update task status'
    }
  }
}
