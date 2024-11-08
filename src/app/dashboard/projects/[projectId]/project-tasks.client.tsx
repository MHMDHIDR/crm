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
import { updateTask, updateTaskStatus } from '@/actions/tasks/update-task'
import { TaskForm } from '@/components/custom/task-form'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { TaskStatus } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { getInitialProjectValues, taskSchema, TaskSchemaType } from '@/validators/task'
import type { Task, TasksByStatus } from '@/db/schema'

type ColumnType = 'pending' | 'in-progress' | 'completed'

const TaskCard = ({ task, onViewDetails }: { task: Task; onViewDetails: (task: Task) => void }) => {
  const formattedDate = formatDate(String(task.dueDate))
  return (
    <Card className='rounded-lg cursor-pointer dark:hover:border-rose-900 hover:border-rose-200 hover:border-dashed hover:shadow-md'>
      <CardContent onClick={() => onViewDetails(task)} className='p-2.5'>
        <h3 className='text-lg font-semibold'>{task.title}</h3>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>
          {task.description}
        </p>
        <div className='mt-4'>
          <span className='text-sm text-gray-500'>Due: {formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const Column = ({
  title,
  tasks,
  status,
  onViewDetails
}: {
  title: string
  tasks: Task[]
  status: ColumnType
  onViewDetails: (task: Task) => void
}) => (
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
                    <TaskCard task={task} onViewDetails={onViewDetails} />
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
                      <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
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

        <div className='flex justify-end mt-4'>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function ProjectTasksClientPage({
  projectId,
  initialTasks
}: {
  projectId: string
  initialTasks: TasksByStatus
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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
      const updatedTasks = await getTasksByStatus({ projectId })
      if (updatedTasks?.data) {
        setTasks(updatedTasks.data)
      }
      setIsSheetOpen(false)
    } else {
      toast.error(result.message)
    }
  }

  const handleUpdateTask = async (data: z.infer<typeof taskSchema>) => {
    if (!selectedTask) return

    const result = await updateTask({ ...data, taskId: selectedTask.id })
    if (result.success) {
      toast.success(result.message)
      const updatedTasks = await getTasksByStatus({ projectId })
      if (updatedTasks?.data) {
        setTasks(updatedTasks.data)
      }
      setIsSheetOpen(false)
      setSelectedTask(null)
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

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setIsSheetOpen(true)
  }

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center w-full gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb className='flex-1'>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard/projects'>Projects</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href='/dashboard/create-project'>
            <Button>Add New Project</Button>
          </Link>
        </div>
      </header>
      <main className='w-full'>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>{selectedTask ? 'Update Task' : 'Create Task'}</Button>
          </SheetTrigger>
          <SheetContent side='bottom'>
            <SheetHeader>
              <SheetTitle>{selectedTask ? 'Update Task' : 'Create Task'}</SheetTitle>
              <SheetDescription>
                {selectedTask
                  ? 'Update the task details.'
                  : 'Fill in the details for your new task.'}
              </SheetDescription>
            </SheetHeader>
            <TaskForm
              onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
              onSuccess={() => setIsSheetOpen(false)}
              initialData={selectedTask || undefined}
              submitButtonText={selectedTask ? 'Update Task' : 'Create Task'}
              isEditing={!!selectedTask}
            />
          </SheetContent>
        </Sheet>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className='grid grid-cols-3 gap-6 mt-6'>
            <Column
              title='Pending'
              tasks={tasks.pending}
              status='pending'
              onViewDetails={handleViewDetails}
            />
            <Column
              title='In Progress'
              tasks={tasks['in-progress']}
              status='in-progress'
              onViewDetails={handleViewDetails}
            />
            <Column
              title='Completed'
              tasks={tasks.completed}
              status='completed'
              onViewDetails={handleViewDetails}
            />
          </div>
        </DragDropContext>
      </main>
    </SidebarInset>
  )
}
