import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { useToast } from '@/hooks/use-toast'
import { clsx, cn } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { getInitialProjectValues, taskSchema, TaskSchemaType } from '@/validators/task'
import type { Task } from '@/db/schema'

type TaskFormProps = {
  onSubmit: (data: z.infer<typeof taskSchema>) => void
  onSuccess?: () => void
  initialData?: Task
  submitButtonText?: string
  isEditing?: boolean
}

export function TaskForm({
  onSubmit,
  onSuccess,
  initialData,
  submitButtonText = 'Create Task',
  isEditing = false
}: TaskFormProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toast = useToast()

  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || getInitialProjectValues()
  })

  async function handleSubmit(data: z.infer<typeof taskSchema>) {
    onSubmit(data)
    onSuccess?.()
    if (!isEditing) {
      form.reset()
    }
  }

  async function handleDeleteConfirm() {
    if (!initialData?.id) return

    setIsDeleting(true)
    try {
      const result = await deleteTasks([initialData.id])

      if (result.success) {
        onSuccess?.()
        toast.success(result.message || 'Task deleted successfully')

        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete the task. Please try again!')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
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
                <FormLabel>Description</FormLabel>
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
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild className='min-w-full'>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={clsx('w-[240px] pl-3 text-left font-normal', {
                          'text-muted-foreground': !field.value
                        })}
                      >
                        {field.value ? formatDate(String(field.value)) : <span>Pick a date</span>}
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
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select Task Status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end mt-4 gap-x-2.5'>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {submitButtonText}
            </Button>
            {isEditing && (
              <Button
                variant='destructive'
                type='button'
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
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
