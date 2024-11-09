'use server'

import { inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { tasks } from '@/db/schema'

/**
 * Delete one or multiple tasks from the database
 * @param taskIds - Array of tasks IDs to delete
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deleteTasks(
  taskIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input
    if (!taskIds.length) {
      return { success: false, message: 'No tasks selected for deletion' }
    }

    // Delete tasks from the database
    const deletedTasks = await database.delete(tasks).where(inArray(tasks.id, taskIds)).returning()
    const addedEvent = await addEvent(
      `Deleted ${deletedTasks.length} Task${deletedTasks.length > 1 ? 's' : ''}`
    )

    if (!deletedTasks || !addedEvent.success) {
      return { success: false, message: 'Failed to delete tasks. Please try again.' }
    }

    return {
      success: true,
      message: `Task${deletedTasks.length > 1 ? 's' : ''} deleted successfully`
    }
  } catch (error) {
    console.error('Error deleting tasks:', error)
    return {
      success: false,
      message: `Failed to Delete The Task. Please Try Again!`
    }
  }
}
