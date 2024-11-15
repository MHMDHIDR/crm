'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
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
  const actionsTranslations = await getTranslations('actions')

  try {
    const [updatedTask] = await database
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, taskId))
      .returning()
    const addedEvent = await addEvent(
      actionsTranslations('taskStatusUpdated', {
        taskTitle: updatedTask.title,
        status
      })
    )

    if (!updatedTask || !addedEvent.success) {
      return {
        success: false,
        message: actionsTranslations('failedUpdateTaskStatus')
      }
    }

    return {
      success: true,
      message: actionsTranslations('taskStatusUpdated', {
        taskTitle: updatedTask.title,
        status
      })
    }
  } catch (error) {
    console.error('Error updating task status:', error)
    return {
      success: false,
      message: actionsTranslations('failedUpdateTaskStatus')
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
  const actionsTranslations = await getTranslations('actions')

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

    const addedEvent = await addEvent(
      actionsTranslations('taskUpdated', {
        taskTitle: updatedTask.title
      })
    )

    if (!updatedTask || !addedEvent.success) {
      return {
        success: false,
        message: actionsTranslations('failedUpdateTask')
      }
    }

    return {
      success: true,
      message: actionsTranslations('taskUpdated', {
        taskTitle: updatedTask.title
      }),
      data: updatedTask
    }
  } catch (error) {
    console.error('Error updating task:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('unknownError')
    }
  }
}
