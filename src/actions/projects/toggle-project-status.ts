'use server'

import { inArray } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
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
  const actionsTranslations = await getTranslations('actions')

  try {
    // Validate input
    if (!projectIds.length) {
      return {
        success: false,
        message: actionsTranslations('noProjectsSelectedForStatus', { status })
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
        message: actionsTranslations('failedActivateProjects', { status })
      }
    }

    // Create event entries for all updated projects
    const eventPromises = toggledProjects.map(project =>
      addEvent(actionsTranslations('activatedProject', { ProjectName: project.name, status }))
    )
    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)
    // Check if any events failed to be added, Add event for the status change
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
    }

    return {
      success: true,
      message: actionsTranslations('projectsStatusChanged', {
        count: toggledProjects.length,
        status
      })
    }
  } catch (error) {
    console.error(`Error ${status === 'active' ? 'activating' : 'deactivating'} projects:`, error)
    return { success: false, message: actionsTranslations('failedAction') }
  }
}
