'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { use, useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createTask } from '@/actions/tasks/create-task'
import { getTasks } from '@/actions/tasks/get-task'
import { updateTaskStatus } from '@/actions/tasks/update-task'
import { LoadingCard } from '@/components/custom/loading'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
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
import type { ExtendedProject, TaskWithRelations } from '@/db/schema'

type ColumnType = 'pending' | 'in-progress' | 'completed'
type TasksByStatus = {
  pending: TaskWithRelations[]
  'in-progress': TaskWithRelations[]
  completed: TaskWithRelations[]
}

const TaskCard = ({
  task,
  onDrop
}: {
  task: TaskWithRelations
  onDrop: (task: TaskWithRelations) => void
}) => {
  const formattedDate = new Date(task.dueDate!).toLocaleDateString()
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => onDrop(task)
  })

  return (
    <div {...getRootProps()} className='mb-4 hover:shadow-lg transition-shadow'>
      <input {...getInputProps()} />
      <Card className='cursor-pointer'>
        <CardContent className='p-4'>
          <h3 className='font-semibold text-lg'>{task.title}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2'>
            {task.description}
          </p>
          <div className='mt-4 flex justify-between items-center'>
            <span className='text-sm text-gray-500'>Due: {formattedDate}</span>
            <Button variant='outline' size='sm' asChild>
              <a href={`/dashboard/tasks/${task.id}`}>View Details</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const Column = ({
  title,
  tasks,
  status,
  onDrop
}: {
  title: string
  tasks: TaskWithRelations[]
  status: ColumnType
  onDrop: (task: TaskWithRelations) => void
}) => {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          <span>{title}</span>
          <span className='text-sm bg-primary/20 px-2 py-1 rounded-full'>{tasks.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='h-[calc(100vh-250px)] overflow-y-auto p-4'>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDrop={onDrop} />
        ))}
      </CardContent>
    </Card>
  )
}

const TaskCreateForm = ({ onSubmit }: { onSubmit: (data: z.infer<typeof taskSchema>) => void }) => {
  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: getInitialProjectValues()
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
                    selected={new Date(field.value!)}
                    onSelect={field.onChange}
                    disabled={date => {
                      const dueDate = form.getValues('dueDate')
                      // The due date should be in the future
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
              <Select {...field}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a Status' />
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

  const [project, setProject] = useState<ExtendedProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<TasksByStatus>({
    pending: [],
    'in-progress': [],
    completed: []
  })

  const toast = useToast()

  const fetchProjectAndTasks = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    const tasksResult = await getTasks(projectId as string)

    if (tasksResult.success && tasksResult.data) {
      const groupedTasks = tasksResult.data.reduce(
        (acc: TasksByStatus, task) => {
          const status = task.status as ColumnType
          acc[status] = [...(acc[status] || []), task]
          return acc
        },
        { pending: [], 'in-progress': [], completed: [] }
      )

      setTasks(groupedTasks)
    }

    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchProjectAndTasks()
  }, [fetchProjectAndTasks])

  const handleDrop = async (task: TaskWithRelations) => {
    const newTasks = { ...tasks }

    const sourceColumn = Object.keys(newTasks).find(key =>
      newTasks[key as ColumnType].includes(task)
    )! as ColumnType
    const sourceIndex = newTasks[sourceColumn].findIndex(t => t.id === task.id)
    const [movedTask] = newTasks[sourceColumn].splice(sourceIndex, 1)

    const destColumn = sourceColumn === 'pending' ? 'in-progress' : 'completed'
    newTasks[destColumn].push(movedTask)

    setTasks(newTasks)

    const result = await updateTaskStatus({ taskId: task.id, status: destColumn })

    if (result.success) {
      toast.success(`Task status updated to ${destColumn}`)
    } else {
      toast.error('Failed to update task status')
      fetchProjectAndTasks()
    }
  }

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleCreateTask = async (data: z.infer<typeof taskSchema>) => {
    const result = await createTask({ ...data, projectId: projectId! })
    if (result.success) {
      toast.success(result.message)
      setIsSheetOpen(false)
      await fetchProjectAndTasks()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <SidebarInset>
      {loading ? (
        <LoadingCard />
      ) : (
        <>
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex gap-2 items-center w-full'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb className='flex-1'>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <Separator orientation='vertical' className='mx-2 h-4' />
                  <BreadcrumbItem>
                    <BreadcrumbLink href='/dashboard/projects'>Projects</BreadcrumbLink>
                  </BreadcrumbItem>
                  <Separator orientation='vertical' className='mx-2 h-4' />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/dashboard/projects/${projectId}`}>
                      {project?.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>Tasks</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Sheet>
                <SheetTrigger asChild>
                  <Button>Create Task</Button>
                </SheetTrigger>
                <SheetContent side='bottom'>
                  <SheetHeader>
                    <SheetTitle>Create Task</SheetTitle>
                    <SheetDescription>Fill in the details for your new task.</SheetDescription>
                  </SheetHeader>
                  <TaskCreateForm onSubmit={handleCreateTask} />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <main className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <Column title='Pending' tasks={tasks.pending} status='pending' onDrop={handleDrop} />
              <Column
                title='In Progress'
                tasks={tasks['in-progress']}
                status='in-progress'
                onDrop={handleDrop}
              />
              <Column
                title='Completed'
                tasks={tasks.completed}
                status='completed'
                onDrop={handleDrop}
              />
            </div>
          </main>
        </>
      )}
    </SidebarInset>
  )
}
