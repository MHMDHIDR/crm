'use server'

import crypto from 'crypto'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/env'

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_ID, secretAccessKey: env.AWS_SECRET }
})

function generateUniqueFileName(taskId: string, fileName: string): string {
  const uniqueSuffix = crypto.randomBytes(8).toString('hex')
  return `${taskId}/${uniqueSuffix}-${fileName}`
}

type FileData = {
  name: string
  type: string
  size: number
  lastModified: number
  base64: string
}

/**
 * A function to upload files to S3
 * @param fileData  An array of file data (with base64 encoded files)
 * @param taskId The ID of the task to associate the files with
 * @returns       An array of URLs for the uploaded files
 */
export async function uploadFiles(fileData: Array<FileData>, taskId: string) {
  const presignedUrls = await Promise.all(
    fileData.map(async file => {
      const uniqueFileName = generateUniqueFileName(taskId, file.name)
      const putObjectParams = {
        Bucket: env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: file.type
      }

      const putCommand = new PutObjectCommand(putObjectParams)
      const presignedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

      return { presignedUrl, fileName: uniqueFileName }
    })
  )

  const uploadPromises = presignedUrls.map(async ({ fileName, presignedUrl }, index) => {
    // Decode the base64 string to binary data
    const base64Data = fileData[index].base64.split(',')[1]
    const binaryData = Buffer.from(base64Data, 'base64')

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: binaryData,
      headers: { 'Content-Type': fileData[index].type }
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${fileName}`)
    }

    // Generate a GET URL for the uploaded file
    const getObjectParams = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: fileName
    }
    const getCommand = new GetObjectCommand(getObjectParams)
    const getUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }) // URL valid for 7 days

    // Remove query parameters from the signed URL to get a clean, permanent URL
    const cleanUrl = new URL(getUrl)
    cleanUrl.search = ''

    return cleanUrl.toString()
  })

  const uploadedUrls = await Promise.all(uploadPromises)
  return uploadedUrls
}
