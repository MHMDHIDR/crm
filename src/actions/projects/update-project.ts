'use server'

import { eq } from 'drizzle-orm'
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
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    // Check if another project already uses this name (excluding current project)
    const existingProject = await database
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.name, data.name))
      .limit(1)

    if (existingProject.length > 0 && existingProject[0].id !== projectId) {
      return { success: false, message: 'A project with this name already exists' }
    }

    // Update the project record
    const [updatedProject]: Project[] = await database
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning()

    const addedEvent = await addEvent(`Project ${updatedProject.name} updated`)

    if (!updatedProject || !addedEvent.success) {
      return { success: false, message: 'Failed to update project' }
    }

    return {
      success: true,
      message: `${updatedProject.name} has been Updated Successfully 🎉.`
    }
  } catch (error) {
    console.error('Project update error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to update project. Please try again.'
    }
  }
}
