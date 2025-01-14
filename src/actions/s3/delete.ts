'use server'

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
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

    return { success: true, message: tasksTranslations('filesDeleted') }
  } catch (error) {
    console.error('Error deleting files from S3:', error)
    return { success: false, message: tasksTranslations('filesFailedDelete') }
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
    // Extract the key from the S3 URL by getting everything after the bucket name
    const bucketDomain = `${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`
    const key = decodeURI(fileUrl.split(`${bucketDomain}/`)[1])

    if (!key) {
      return { success: false, message: tasksTranslations('invalidURL') }
    }

    // Extract taskId from the key (first part of the path)
    const taskId = key.split('/')[0]

    if (!taskId) {
      return { success: false, message: tasksTranslations('invalidURL') }
    }

    // Get the current task to get its existing files
    const currentTask = await database.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    })

    if (!currentTask) {
      return { success: false, message: tasksTranslations('projectFailedUpdate') }
    }

    // Find the exact file URL in the task's files array
    const fileExists = currentTask.files?.some(file => file === fileUrl)
    if (!fileExists) {
      return { success: false, message: tasksTranslations('invalidURL') }
    }

    // Delete from S3
    const deleteParams = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key
    }

    const deleteCommand = new DeleteObjectCommand(deleteParams)
    await s3Client.send(deleteCommand)

    // Update the task by removing the deleted file URL
    const updatedFiles = currentTask.files?.filter(file => file !== fileUrl) || []
    const [updatedTask] = await database
      .update(tasks)
      .set({ files: updatedFiles })
      .where(eq(tasks.id, taskId))
      .returning()

    if (!updatedTask) {
      return { success: false, message: tasksTranslations('projectFailedUpdate') }
    }

    return { success: true, message: tasksTranslations('fileDeleted') }
  } catch (error) {
    console.error('Error deleting file from S3 or updating task:', error)
    return { success: false, message: tasksTranslations('fileFailedDelete') }
  }
}
