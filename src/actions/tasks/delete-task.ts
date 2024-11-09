'use server'

import { eq, inArray } from 'drizzle-orm'
import { addEvent } from '@/actions/events/add-event'
import { database } from '@/db'
import { projects, tasks } from '@/db/schema'

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

    // First, get the task details with project names before deletion
    const tasksWithProjects = await database
      .select({ taskId: tasks.id, taskTitle: tasks.title, projectName: projects.name })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(inArray(tasks.id, taskIds))

    if (!tasksWithProjects.length) {
      return { success: false, message: 'Tasks not found' }
    }

    // Delete tasks from the database
    const deletedTasks = await database.delete(tasks).where(inArray(tasks.id, taskIds)).returning()

    if (!deletedTasks.length) {
      return { success: false, message: 'Failed to delete tasks. Please try again.' }
    }

    // Create event entries for all deleted tasks using the project names we fetched
    const eventPromises = tasksWithProjects.map(task =>
      addEvent(
        `Deleted "${task.taskTitle}" From [${task.projectName || 'Unknown Project'}] from the Records!`
      )
    )

    // Wait for all events to be added
    const eventResults = await Promise.all(eventPromises)

    // Check if any events failed to be added
    if (eventResults.some(result => !result.success)) {
      console.warn('Some events failed to be recorded: ', eventResults)
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
