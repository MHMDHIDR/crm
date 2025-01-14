import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { deleteSingleObject } from '@/actions/s3/delete'
import { isImageFile } from '@/actions/s3/optimize-image'
import { useToast } from '@/hooks/use-toast'
import EmptyState from './empty-state'

type FileUploadProps = {
  onFilesSelected(_files: Array<File>): void
  ignoreRequired?: boolean
  resetFiles?: boolean
  existingFiles?: string[]
  onExistingFileDelete?: (fileUrl: string) => void
}

export function FileUpload({
  onFilesSelected,
  resetFiles = false,
  existingFiles = [],
  onExistingFileDelete
}: FileUploadProps) {
  const [files, setFiles] = useState<Array<File>>([])
  const toast = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles]
      setFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [files, onFilesSelected]
  )

  useEffect(() => {
    if (resetFiles) {
      setFiles([])
    }
  }, [resetFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(file => file !== fileToRemove)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const handleExistingFileDelete = async (fileUrl: string) => {
    try {
      const result = await deleteSingleObject({ fileUrl })
      if (result.success) {
        onExistingFileDelete?.(fileUrl)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const dashboardImgaesTranslations = useTranslations('dashboard.tasks.files')

  return (
    <div className='w-full'>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer transition-colors duration-300 ${
          isDragActive ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <span>
            {dashboardImgaesTranslations(
              `selectedFiles_${files.length > 1 ? 'Multiple' : 'Single'}`,
              { count: files.length }
            )}
          </span>
        ) : (
          <EmptyState isSmall>
            {isDragActive
              ? dashboardImgaesTranslations('dropFilesHere')
              : dashboardImgaesTranslations('dragAndDropFiles')}
          </EmptyState>
        )}
      </div>

      {(files.length > 0 || existingFiles.length > 0) && (
        <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {/* Display existing files */}
          {existingFiles.map((fileUrl, index) => (
            <div key={`existing-${index}`} className='relative group'>
              <div className='aspect-square relative overflow-hidden rounded-lg'>
                {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={fileUrl}
                    alt={`Existing file ${index + 1}`}
                    layout='fill'
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800'>
                    <span className='text-sm text-gray-500'>File {index + 1}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleExistingFileDelete(fileUrl)}
                type='button'
                className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              >
                <X className='w-4 h-4' />
              </button>
              <p className='text-xs mt-1 truncate'>{fileUrl.split('/').pop()}</p>
            </div>
          ))}

          {/* Display new files */}
          {files.map((file, index) => (
            <div key={`new-${index}`} className='relative group'>
              <div className='aspect-square relative overflow-hidden rounded-lg'>
                {file.type.startsWith('image/') ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    layout='fill'
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800'>
                    <span className='text-sm text-gray-500'>{file.name.split('.').pop()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeFile(file)}
                type='button'
                className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              >
                <X className='w-4 h-4' />
              </button>
              <p className='text-xs mt-1 truncate'>{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
