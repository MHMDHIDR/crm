'use server'

import { inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { Project, projects } from '@/db/schema'

type ProjectStatus = 'active' | 'deactivated'

/**
 * Toggle status of one or multiple projects in the database
 * @param projectIds - Array of project IDs to toggle
 * @param status - Status to set ('active' or 'deactivated')
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
    const toggledProjects: Project[] = await database
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(inArray(projects.id, projectIds))
      .returning()

    // Check if we got any results
    if (!toggledProjects.length) {
      return {
        success: false,
        message: `Failed to ${status === 'active' ? 'activate' : 'deactivate'} projects`
      }
    }

    // Create event entries for all updated projects
    const eventPromises = toggledProjects.map(project =>
      addEvent(`${project.name} ${status === 'active' ? 'Activated' : 'Deactivated'}!`)
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added, Add event for the status change
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
    }

    return {
      success: true,
      message: `${toggledProjects.length} project${toggledProjects.length > 1 ? 's' : ''} ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    }
  } catch (error) {
    console.error(`Error ${status === 'active' ? 'activating' : 'deactivating'} projects:`, error)
    return {
      success: false,
      message: `Failed to ${status === 'active' ? 'activate' : 'deactivate'} projects. Please try again.`
    }
  }
}
