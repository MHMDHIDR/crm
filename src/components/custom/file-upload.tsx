import { FileText, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { deleteSingleObject } from '@/actions/s3/delete'
import { isImageFile } from '@/actions/s3/optimize-image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
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
    } finally {
      setFileToDelete(null)
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
              <div className='aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-28 h-28 flex items-center justify-center'>
                {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={fileUrl}
                    alt={`File ${index + 1}`}
                    width={112}
                    height={112}
                    className='object-cover w-28 h-28'
                  />
                ) : (
                  <FileText className='w-10 h-10 text-gray-500' />
                )}
              </div>
              <AlertDialog
                open={fileToDelete === fileUrl}
                onOpenChange={() => setFileToDelete(null)}
              >
                <button
                  onClick={() => setFileToDelete(fileUrl)}
                  type='button'
                  className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                >
                  <X className='w-4 h-4' />
                </button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your file.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleExistingFileDelete(fileUrl)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {/* Display new files */}
          {files.map((file, index) => (
            <div key={`new-${index}`} className='relative group'>
              <div className='aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 w-28 h-28 flex items-center justify-center'>
                {file.type.startsWith('image/') ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`File ${index + 1}`}
                    width={112}
                    height={112}
                    className='object-cover w-28 h-28'
                  />
                ) : (
                  <FileText className='w-10 h-10 text-gray-500' />
                )}
              </div>
              <button
                onClick={() => removeFile(file)}
                type='button'
                className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
