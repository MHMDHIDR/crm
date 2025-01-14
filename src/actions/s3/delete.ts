'use server'

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { updateTask } from '@/actions/tasks/update-task'
import { database } from '@/db'
import { tasks } from '@/db/schema'
import { env } from '@/env'

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_ID, secretAccessKey: env.AWS_SECRET }
})

/**
 * Deletes all objects in the "folder" (objects with the taskId prefix)
 * @param taskId - The ID of the task
 * @returns - Promise<{ success: boolean; message: string }>
 */
export async function deleteMultipleObjects({
  taskId
}: {
  taskId: string
}): Promise<{ success: boolean; message: string }> {
  const tasksTranslations = await getTranslations('dashboard.tasks.files')

  try {
    // List all objects in the "folder" (objects with the taskId prefix)
    const listCommand = new ListObjectsV2Command({
      Bucket: env.AWS_BUCKET_NAME,
      Prefix: `${taskId}/`
    })

    const listedObjects = await s3Client.send(listCommand)

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      const deleteParams = {
        Bucket: env.AWS_BUCKET_NAME,
        Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) }
      }

      const deleteCommand = new DeleteObjectsCommand(deleteParams)
      await s3Client.send(deleteCommand)

      // If there are more than 1000 objects, we need to make multiple delete requests
      if (listedObjects.IsTruncated) {
        // Recursive call to delete remaining objects, this will continue until all objects are deleted
        await deleteMultipleObjects({ taskId })
      }
    }

    return { success: true, message: tasksTranslations('imgsDeleted') }
  } catch (error) {
    console.error('Error deleting files from S3:', error)
    return { success: false, message: tasksTranslations('imgsFailedDelete') }
  }
}

/**
 * Deletes a single object from S3 and updates the task by removing the deleted file URL
 * @param fileUrl - The URL of the file to delete
 * @returns - Promise<{ success: boolean; message: string }>
 */
export async function deleteSingleObject({
  fileUrl
}: {
  fileUrl: string
}): Promise<{ success: boolean; message: string }> {
  const tasksTranslations = await getTranslations('dashboard.tasks.files')

  try {
    // Extract the key and taskId from the fileUrl
    const urlParts = fileUrl.split('/')
    const taskId = urlParts[3] // The part after 'com/'
    const key = urlParts.slice(3).join('/')
    const decodedKey = decodeURI(key) //doing this because if the key has spaces and we need to remove the %20

    if (!decodedKey || !taskId) {
      return { success: false, message: tasksTranslations('invalidURL') }
    }

    const deleteParams = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: decodedKey
    }

    const deleteCommand = new DeleteObjectCommand(deleteParams)
    await s3Client.send(deleteCommand)

    // Get the current task to get its existing files
    const currentTask = await database.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    })

    if (!currentTask) {
      return { success: false, message: tasksTranslations('projectFailedUpdate') }
    }

    // Update the task by removing the deleted file URL
    const updatedFiles = currentTask.files?.filter(file => file !== fileUrl) || []
    const updateResult = await updateTask({
      taskId,
      title: currentTask.title,
      description: currentTask.description,
      dueDate: currentTask.dueDate,
      status: currentTask.status,
      files: updatedFiles
    })

    if (!updateResult.success) {
      return { success: false, message: tasksTranslations('projectFailedUpdate') }
    }

    return { success: true, message: tasksTranslations('imgDeleted') }
  } catch (error) {
    console.error('Error deleting file from S3 or updating task:', error)
    return { success: false, message: tasksTranslations('imgFailedDelete') }
  }
}
