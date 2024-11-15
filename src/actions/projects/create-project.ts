'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { Project, projects } from '@/db/schema'
import type { ProjectSchemaType } from '@/validators/project'

type CreatProjectResult = { success: boolean; message: string }

export async function createProject(data: ProjectSchemaType): Promise<CreatProjectResult> {
  const actionsTranslations = await getTranslations('actions')

  // Get the current assigned employee ID
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: actionsTranslations('unauthorized') }
  }

  try {
    // Check if the project already exists
    const existingClient = await database
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.name, data.name))
      .limit(1)

    if (existingClient.length > 0) {
      return { success: false, message: actionsTranslations('usedEmail') }
    }

    // Create the project record
    const [newProject]: Project[] = await database
      .insert(projects)
      .values({
        ...data,
        assignedEmployeeId: session.user.id
      })
      .returning()
    const addedEvent = await addEvent(
      actionsTranslations('projectCreated', { projectName: newProject.name })
    )

    if (!newProject || !addedEvent.success) {
      return { success: false, message: actionsTranslations('failedAction') }
    }

    return {
      success: true,
      message: actionsTranslations('projectCreated', { projectName: newProject.name })
    }
  } catch (error) {
    console.error('Project creation error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedAction')
    }
  }
}
