'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addEvent } from '@/actions/events/add-event'
import { auth } from '@/auth'
import { database } from '@/db'
import { Project, projects } from '@/db/schema'
import type { ProjectSchemaType } from '@/validators/project'

type UpdateProjectResult = { success: boolean; message: string }

export async function updateProject(
  projectId: string,
  data: ProjectSchemaType
): Promise<UpdateProjectResult> {
  const actionsTranslations = await getTranslations('actions')

  const session = await auth()
  if (!session?.user) {
    return { success: false, message: actionsTranslations('unauthorized') }
  }

  try {
    // Check if another project already uses this name (excluding current project)
    const existingProject = await database
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.name, data.name))
      .limit(1)

    if (existingProject.length > 0 && existingProject[0].id !== projectId) {
      return { success: false, message: actionsTranslations('similarProjectExists') }
    }

    // Update the project record
    const [updatedProject]: Project[] = await database
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning()

    const addedEvent = await addEvent(
      actionsTranslations('updatedProject', { clientName: updatedProject.name })
    )

    if (!updatedProject || !addedEvent.success) {
      return { success: false, message: actionsTranslations('failedUpdate') }
    }

    return {
      success: true,
      message: actionsTranslations('updatedProject', { clientName: updatedProject.name })
    }
  } catch (error) {
    console.error('Project update error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : actionsTranslations('failedUpdate')
    }
  }
}
