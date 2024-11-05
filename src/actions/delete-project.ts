'use server'

import { inArray } from 'drizzle-orm'
import { database } from '@/db'
import { projects } from '@/db/schema'

/**
 * Delete one or multiple projects from the database
 * @param projectIds - Array of project IDs to delete
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deleteProjects(
  projectIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!projectIds.length) {
      return { success: false, message: 'No projects selected for deletion' }
    }

    // Delete projects from the database
    await database.delete(projects).where(inArray(projects.id, projectIds))

    return { success: true, message: 'Projects deleted successfully' }
  } catch (error) {
    console.error('Error deleting projects:', error)
    return { success: false, message: 'Failed to delete projects. Please try again.' }
  }
}
