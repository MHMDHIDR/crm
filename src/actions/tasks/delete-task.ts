'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { deleteMultipleObjects } from '@/actions/s3/delete'
import { database } from '@/db'
import { tasks } from '@/db/schema'

/**
 * Delete one or multiple tasks from the database
 * @param taskIds - Array of tasks IDs to delete
 * @returns Promise<{ success: boolean; message?: string }> with success status and optional message
 */
export async function deleteTasks(taskIds: string[]) {
  try {
    // Delete all files from S3 for each task first
    for (const taskId of taskIds) {
      await deleteMultipleObjects({ taskId })
    }

    // Then delete the tasks from the database
    const deletedTasks = await database.delete(tasks).where(eq(tasks.id, taskIds[0])).returning()

    if (!deletedTasks.length) {
      return {
        success: false,
        message: 'Failed to delete task'
      }
    }

    return {
      success: true,
      message: 'Task deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    return {
      success: false,
      message: 'Failed to delete task'
    }
  }
}
