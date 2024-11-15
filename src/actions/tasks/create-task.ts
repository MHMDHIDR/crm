'use server'

import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { Task, tasks } from '@/db/schema'
import { taskSchema } from '@/validators/task'
import type { z } from 'zod'

type CreateTaskResult = { success: boolean; message: string }

export async function createTask(
  data: z.infer<typeof taskSchema> & { projectId: string }
): Promise<CreateTaskResult> {
  const actionsTranslations = await getTranslations('actions')

  const session = await auth()
  if (!session?.user) {
    return { success: false, message: actionsTranslations('unauthorized') }
  }

  try {
    const [newTask]: Task[] = await database
      .insert(tasks)
      .values({ ...data, projectId: data.projectId, assignedEmployeeId: session.user.id })
      .returning()
    const addedEvent = await addEvent(`Task ${newTask.title} created`)

    if (!newTask || !addedEvent.success) {
      return { success: false, message: actionsTranslations('failedCreateTask') }
    }

    return {
      success: true,
      message: actionsTranslations('taskCreated', { taskTitle: newTask.title })
    }
  } catch (error) {
    console.error('Task creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedCreateTask')
    }
  }
}
