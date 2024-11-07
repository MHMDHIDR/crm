'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createTask } from '@/actions/tasks/create-task'
import { getTasksByStatus } from '@/actions/tasks/get-task'
import { updateTaskStatus } from '@/actions/tasks/update-task'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { TaskStatus } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { getInitialProjectValues, taskSchema, TaskSchemaType } from '@/validators/task'
import type { Task, TasksByStatus } from '@/db/schema'

type ColumnType = 'pending' | 'in-progress' | 'completed'

const TaskCard = ({ task }: { task: Task }) => {
  const formattedDate = formatDate(String(task.dueDate))

  return (
    <Card className='cursor-pointer'>
      <CardContent className='p-2.5'>
        <h3 className='font-semibold text-lg'>{task.title}</h3>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2'>
          {task.description}
        </p>
        <div className='mt-4'>
          <span className='text-sm text-gray-500'>Due: {formattedDate}</span>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const Column = ({ title, tasks, status }: { title: string; tasks: Task[]; status: ColumnType }) => (
  <Card className='h-full'>
    <CardHeader className='px-4'>
      <CardTitle>
        {title} ({tasks.length})
      </CardTitle>
    </CardHeader>
    <CardContent className='p-2.5'>
      <Droppable droppableId={status}>
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className='space-y-4'>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </CardContent>
  </Card>
)

const TaskCreateForm = ({
  onSubmit,
  onSuccess
}: {
  onSubmit: (data: z.infer<typeof taskSchema>) => void
  onSuccess?: () => void
}) => {
  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: getInitialProjectValues()
  })

  const handleSubmit = async (data: z.infer<typeof taskSchema>) => {
    onSubmit(data)
    onSuccess?.()
    form.reset()
  }

  return (
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
                <Textarea {...field} />
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
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? formatDate(String(field.value)) : <span>Pick a date</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={date => {
                      const dueDate = form.getValues('dueDate')
                      return date < new Date() || (dueDate && date < new Date(dueDate))
                    }}
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

        <div className='mt-4 flex justify-end'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [tasks, setTasks] = useState<TasksByStatus>({
    pending: [],
    'in-progress': [],
    completed: []
  })

  const toast = useToast()

  const handleCreateTask = async (data: z.infer<typeof taskSchema>) => {
    const result = await createTask({ ...data, projectId })

    if (result.success) {
      toast.success(result.message)
      // Refresh tasks after creation
      const updatedTasks = await getTasksByStatus({ projectId })
      if (updatedTasks?.data) {
        setTasks(updatedTasks.data)
      }

      // Close the sheet here
      if (updatedTasks?.success) {
        setIsSheetOpen(false)
      }
    } else {
      toast.error(result.message)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColumn = source.droppableId as ColumnType
    const destinationColumn = destination.droppableId as ColumnType

    if (sourceColumn === destinationColumn && source.index === destination.index) return

    const newTasks = { ...tasks }
    const [movedTask] = newTasks[sourceColumn].splice(source.index, 1)
    newTasks[destinationColumn].splice(destination.index, 0, movedTask)

    setTasks(newTasks)

    const response = await updateTaskStatus({ taskId: movedTask.id, status: destinationColumn })
    if (response.success) {
      toast.success(`Updated to ${destinationColumn}`)
    } else {
      toast.error('Failed to update task status')
    }
  }

  useEffect(() => {
    const initializeTasks = async () => {
      const result = await getTasksByStatus({ projectId })
      if (result?.data) {
        setTasks(result.data)
      }
    }
    initializeTasks()
  }, [])

  return (
    <div className='p-6'>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button>Create Task</Button>
        </SheetTrigger>
        <SheetContent side='bottom'>
          <SheetHeader>
            <SheetTitle>Create Task</SheetTitle>
            <SheetDescription>Fill in the details for your new task.</SheetDescription>
          </SheetHeader>
          <TaskCreateForm onSubmit={handleCreateTask} onSuccess={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className='grid grid-cols-3 gap-6 mt-6'>
          <Column title='Pending' tasks={tasks.pending} status='pending' />
          <Column title='In Progress' tasks={tasks['in-progress']} status='in-progress' />
          <Column title='Completed' tasks={tasks.completed} status='completed' />
        </div>
      </DragDropContext>
    </div>
  )
}
