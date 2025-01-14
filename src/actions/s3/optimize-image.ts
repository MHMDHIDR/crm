'use server'

import sharp from 'sharp'

/**
 * Optimize an image
 * @param base64 The base64 of the image
 * @param quality The quality of the image
 * @returns The optimized image
 */
export async function optimizeImage(base64: string, quality = 80): Promise<string> {
  try {
    // Remove the data URI prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const optimizedBuffer = await sharp(buffer).webp({ quality }).toBuffer()

    return `data:image/webp;base64,${optimizedBuffer.toString('base64')}`
  } catch (error) {
    console.error('Error optimizing image:', error)
    throw new Error('Failed to optimize image')
  }
}

/**
 * Get the blur placeholder of an image, used for lazy loading
 * @param imageSrc The source of the image
 * @returns The blur placeholder of the image
 */
export async function getBlurPlaceholder(imageSrc: string): Promise<string | null> {
  const response = await fetch(imageSrc)
  if (response.status !== 200) return null

  const buffer = await response.arrayBuffer()
  const { data, info } = await sharp(buffer)
    .resize(10, 10, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true })

  const base64 = `data:image/${info.format};base64,${data.toString('base64')}`
  return base64
}

/**
 * Check if the file is an image, which is jpg | png | gif | webp
 * @param type The type of the file
 * @returns True if the file is an image, false otherwise
 */
export async function isImageFile(type: string): Promise<boolean> {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  return imageTypes.includes(type)
}
