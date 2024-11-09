'use server'

import { inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { Project, projects } from '@/db/schema'

type ProjectStatus = 'active' | 'deactive'

/**
 * Toggle status of one or multiple projects in the database
 * @param projectIds - Array of project IDs to toggle
 * @param status - Status to set ('active' or 'deactive')
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function toggleProjectStatus(
  projectIds: string[],
  status: ProjectStatus
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!projectIds.length) {
      return {
        success: false,
        message: `No Projects Selected For ${status === 'active' ? 'Activation' : 'Deactivation'}! Please Select projects.`
      }
    }

    // Update projects' status and updatedAt field
    const [toggledProjectStatus]: Project[] = await database
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(inArray(projects.id, projectIds))
      .returning()

    const addedEvent = await addEvent(
      `${toggledProjectStatus.name} ${status === 'active' ? 'Activated' : 'Deactivated'}!`
    )

    if (!toggledProjectStatus || !addedEvent.success) {
      return {
        success: false,
        message: `Failed to ${status === 'active' ? 'activate' : 'deactivate'} projects`
      }
    }

    return {
      success: true,
      message: `Projects ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    }
  } catch (error) {
    console.error(`Error ${status === 'active' ? 'activating' : 'deactivating'} projects:`, error)
    return {
      success: false,
      message: `Failed to ${status === 'active' ? 'activate' : 'deactivate'} projects. Please try again.`
    }
  }
}
