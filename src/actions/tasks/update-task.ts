'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { tasks } from '@/db/schema'
import { taskSchema } from '@/validators/task'

type UpdateTaskStatusParams = {
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
    const addedEvent = await addEvent(`Task ${updatedTask.title} status updated to ${status}`)

    if (!updatedTask || !addedEvent.success) {
      return { success: false, message: 'Failed to update task status' }
    }

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

type UpdateTaskParams = z.infer<typeof taskSchema> & {
  taskId: string
}

export async function updateTask({
  taskId,
  title,
  description,
  dueDate,
  status
}: UpdateTaskParams) {
  try {
    const [updatedTask] = await database
      .update(tasks)
      .set({
        title,
        description,
        dueDate: new Date(dueDate),
        status
      })
      .where(eq(tasks.id, taskId))
      .returning()

    const addedEvent = await addEvent(`Task "${updatedTask.title}" updated to ${status}`)

    if (!updatedTask || !addedEvent.success) {
      return { success: false, message: 'Failed to update task' }
    }

    return {
      success: true,
      message: `Task "${updatedTask.title}" updated successfully`,
      data: updatedTask
    }
  } catch (error) {
    console.error('Error updating task:', error)
    return {
      success: false,
      message: 'Failed to update task',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
