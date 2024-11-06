'use server'

import { inArray } from 'drizzle-orm'
import { database } from '@/db'
import { projects } from '@/db/schema'

/**
 * Activate one or multiple projects in the database
 * @param projectIds - Array of project IDs to activate
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function activateProject(
  projectIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!projectIds.length) {
      return {
        success: false,
        message: 'No Projects Selected For Suspension! Please Select projects.'
      }
    }

    // Update projects' updatedAt field with current timestamp using new Date()
    await database
      .update(projects)
      .set({ status: 'active', updatedAt: new Date() })
      .where(inArray(projects.id, projectIds))

    return { success: true, message: 'Projects activated successfully' }
  } catch (error) {
    console.error('Error suspending projects:', error)
    return { success: false, message: 'Failed to activate projects. Please try again.' }
  }
}

/**
 * Unsuspend one or multiple projects in the database
 * @param projectIds - Array of project IDs to deactivated
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deactivateProject(
  projectIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    // Validate input
    if (!projectIds.length) {
      return {
        success: false,
        message: 'No Projects Selected For Deactivation! Please Select projects.'
      }
    }

    // Set updatedAt to null to deactivated projects
    await database
      .update(projects)
      .set({ status: 'deactive', updatedAt: new Date() })
      .where(inArray(projects.id, projectIds))

    return { success: true, message: 'Projects deactivated successfully' }
  } catch (error) {
    console.error('Error deactivating projects:', error)
    return { success: false, message: 'Failed to deactivated projects. Please try again.' }
  }
}
