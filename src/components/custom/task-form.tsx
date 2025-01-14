import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isImageFile, optimizeImage } from '@/actions/s3/optimize-image'
import { uploadFiles } from '@/actions/s3/upload'
import { deleteTasks } from '@/actions/tasks/delete-task'
import { ConfirmationDialog } from '@/components/custom/confirmation-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TaskStatus } from '@/db/schema'
import { clsx } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { getInitialProjectValues, taskSchema, TaskSchemaType } from '@/validators/task'
import { FileUpload } from './file-upload'
import type { Task } from '@/db/schema'

type TaskFormProps = {
  onSubmit: (data: z.infer<typeof taskSchema>) => void
  onDelete: (id: Task['id']) => void
  onSuccess?: () => void
  initialData?: Task
  submitButtonText?: string
  isEditing?: boolean
  isDeleting?: boolean
}

export function TaskForm({
  onSubmit,
  onDelete,
  onSuccess,
  initialData,
  submitButtonText = 'Create Task',
  isEditing = false
}: TaskFormProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [files, setFiles] = useState<Array<File>>([])
  const [existingFiles, setExistingFiles] = useState<string[]>([])
  const tasksTranslation = useTranslations('dashboard.tasks')

  // Initialize existingFiles when initialData changes
  useEffect(() => {
    if (initialData?.files) {
      setExistingFiles(initialData.files)
    }
  }, [initialData])

  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          files: initialData.files || []
        }
      : getInitialProjectValues()
  })

  async function handleSubmit(data: z.infer<typeof taskSchema>) {
    try {
      // Generate taskId here for new tasks
      const taskId = initialData?.id || crypto.randomUUID()

      const fileDataPromises = files.map(async file => {
        let base64: string
        if (await isImageFile(file.type)) {
          // If it's an image, optimize it and convert to webp
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          base64 = await optimizeImage(base64, 70)
          return {
            name: file.name.replace(/\.[^.]+$/, '.webp'),
            type: 'image/webp',
            size: base64.length,
            lastModified: file.lastModified,
            base64
          }
        } else {
          // If it's not an image, just convert to base64
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            base64
          }
        }
      })

      const fileData = await Promise.all(fileDataPromises)

      // Upload files to S3 using the server action if there are files
      let uploadedUrls: string[] = []
      if (fileData.length > 0) {
        uploadedUrls = await uploadFiles(fileData, taskId)
      }

      // Combine existing files with new uploaded files
      const allFiles = [...existingFiles, ...uploadedUrls]

      // For new tasks, include the generated taskId
      if (!isEditing) {
        onSubmit({ ...data, id: taskId, files: allFiles })
      } else {
        onSubmit({ ...data, files: allFiles })
      }

      onSuccess?.()
      if (!isEditing) {
        form.reset()
        setFiles([])
        setExistingFiles([])
      }
    } catch (error) {
      console.error('Error handling file upload:', error)
      throw error
    }
  }

  const handleFilesSelected = (selectedFiles: Array<File>) => {
    setFiles(selectedFiles)
  }

  const handleExistingFileDelete = (fileUrl: string) => {
    setExistingFiles(prev => prev.filter(file => file !== fileUrl))
    form.setValue(
      'files',
      existingFiles.filter(file => file !== fileUrl)
    )
  }

  async function handleDeleteConfirm() {
    if (!initialData?.id) return

    form.reset()
    onDelete(initialData?.id)

    if (!isEditing) {
      form.reset()
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6 sm:px-8 px-3 pb-10'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tasksTranslation('newTask.title')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tasksTranslation('newTask.description')}</FormLabel>
                <FormControl>
                  <Textarea {...field} className='min-h-32 md:min-h-40 max-h-72' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dueDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tasksTranslation('newTask.dueDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild className='min-w-full'>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={clsx('w-[240px] pl-3 text-left font-normal', {
                          'text-muted-foreground': !field.value
                        })}
                      >
                        {field.value ? (
                          formatDate({ date: String(field.value) })
                        ) : (
                          <span>{tasksTranslation('newTask.pickDate')}</span>
                        )}
                        <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={date => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tasksTranslation('newTask.status')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='rtl:rtl'>
                      <SelectValue placeholder='Select Task Status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='rtl:rtl'>
                    <SelectItem value={TaskStatus.PENDING}>
                      {tasksTranslation('pending')}
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      {tasksTranslation('inProgress')}
                    </SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>
                      {tasksTranslation('completed')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='files'
            render={() => (
              <FormItem>
                <FormLabel>{tasksTranslation('newTask.files')}</FormLabel>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  existingFiles={existingFiles}
                  onExistingFileDelete={handleExistingFileDelete}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end rtl:justify-start mt-4 gap-x-2.5'>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {submitButtonText}
            </Button>
            {isEditing && (
              <Button
                variant='destructive'
                type='button'
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2Icon className='w-6 h-6' />
              </Button>
            )}
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Task'
        description='Are you sure you want to delete this task? This action cannot be undone.'
        buttonText='Delete Task'
        buttonClass='bg-red-600'
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
