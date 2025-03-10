'use client'

import { Notebook, PenBoxIcon, SettingsIcon, ShoppingBagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { z } from 'zod'
import { getProjectById } from '@/actions/projects/get-project'
import { updateProject } from '@/actions/projects/update-project'
import { createTask } from '@/actions/tasks/create-task'
import { deleteTasks } from '@/actions/tasks/delete-task'
import { getTasksByStatus } from '@/actions/tasks/get-task'
import { updateTask, updateTaskStatus } from '@/actions/tasks/update-task'
import { LoadingCard } from '@/components/custom/loading'
import { TaskForm } from '@/components/custom/task-form'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLink,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useToast } from '@/hooks/use-toast'
import { clsx } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { useLocale } from '@/providers/locale-provider'
import { ProjectSchemaType } from '@/validators/project'
import { taskSchema } from '@/validators/task'
import { ProjectEdit } from './project-edit'
import type { ExtendedProject, Task, TasksByStatus } from '@/db/schema'

type ColumnType = 'pending' | 'in-progress' | 'completed'
type ColumnComponentProps = {
  title: string
  tasks: Task[]
  status: ColumnType
  initialTasksCount: ProjectTasksClientPageProps['initialTasksCount']
  isLoading: boolean
  isDragDropReady: boolean
  onViewDetails: (task: Task) => void
}
type ProjectTasksClientPageProps = {
  projectId: ExtendedProject['id']
  initialProject: ExtendedProject | undefined
  initialTasksCount: {
    pending: number
    inProgress: number
    completed: number
  }
}
type BaseResponse = {
  success: boolean
  message: string
}

function TaskCard({
  task,
  onViewDetails,
  className
}: {
  task: Task
  onViewDetails: (task: Task) => void
  className?: string
}) {
  const { locale } = useLocale()
  const isPastDue = new Date(task.dueDate).getTime() - new Date().getTime() < 0
  const isDone = task.status === 'completed'

  return (
    <Card
      className={clsx(
        className,
        'relative rounded-lg cursor-grab dark:hover:border-rose-900 hover:border-rose-200 hover:border-dashed hover:shadow-md min-w-80 max-w-[21rem] h-28 overflow-hidden',
        { 'bg-red-100 dark:bg-red-950': isPastDue, 'bg-green-100 dark:bg-green-950': isDone }
      )}
      title={task.title}
    >
      <CardContent onClick={() => onViewDetails(task)} className='flex flex-col p-2 gap-y-3'>
        <CardTitle>{`${task.title.slice(0, 35)}...`}</CardTitle>
        <CardDescription className='text-sm leading-6 text-gray-500 dark:text-gray-400 line-clamp-2'>
          {`${task.description.slice(0, 70)}...`}
        </CardDescription>
        <CardFooter className='absolute inline-block p-0 text-sm text-gray-500 bottom-1'>
          Due: {formatDate({ date: String(task.dueDate), locale, isNormalDate: false })}
        </CardFooter>
      </CardContent>
    </Card>
  )
}

function Column({
  title,
  tasks,
  status,
  isLoading,
  isDragDropReady,
  initialTasksCount,
  onViewDetails
}: ColumnComponentProps) {
  const getSkeletonCount = () => {
    switch (status) {
      case 'pending':
        return initialTasksCount.pending
      case 'in-progress':
        return initialTasksCount.inProgress
      case 'completed':
        return initialTasksCount.completed
      default:
        return 0
    }
  }
  const tasksTranslation = useTranslations('dashboard.tasks')

  return (
    <Card className='bg-slate-50 dark:bg-slate-950 max-h-fit'>
      <CardHeader className='px-4 pb-1'>
        <CardTitle className='flex gap-x-1.5 items-center'>
          <span>{title}</span>
          <Badge
            className='rounded-full'
            variant={
              status === 'pending' ? 'outline' : status === 'in-progress' ? 'warning' : 'success'
            }
          >
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-2.5'>
        {isDragDropReady ? (
          <Droppable droppableId={status} isDropDisabled={false} direction='vertical'>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className='space-y-2 overflow-x-hidden min-h-[50px]'
              >
                {isLoading ? (
                  <LoadingCard
                    renderedSkeletons={getSkeletonCount()}
                    className='min-w-80 max-w-[21rem] h-28'
                  />
                ) : tasks.length === 0 ? (
                  <div className='text-sm text-gray-400 text-center min-w-[21rem]'>
                    {tasksTranslation('noTasks')}
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard
                            task={task}
                            onViewDetails={onViewDetails}
                            className='dark:bg-slate-900'
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <div className='space-y-2 overflow-x-hidden min-h-[50px]'>
            <LoadingCard
              renderedSkeletons={getSkeletonCount()}
              className='min-w-80 max-w-[21rem] h-28'
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* eslint-disable max-lines */
export default function ProjectTasksClientPage({
  projectId,
  initialProject,
  initialTasksCount
}: ProjectTasksClientPageProps) {
  const tasksTranslation = useTranslations('dashboard.tasks')
  const dashboardProjectsTranslation = useTranslations('dashboard.dataTable.tableToolbar')

  const toast = useToast()

  const [project, setProject] = useState<ExtendedProject | undefined>(initialProject)
  const [isUpdateTaskSheetOpen, setIsUpdateTaskSheetOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDragDropReady, setIsDragDropReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<TasksByStatus>({
    pending: [],
    'in-progress': [],
    completed: []
  })

  function handleSheetOpenChange(open: boolean) {
    setIsUpdateTaskSheetOpen(open)
    if (!open) {
      setSelectedTask(null)
    }
  }

  async function handleTaskOperation<TResponse extends BaseResponse>({
    operation,
    successMessage,
    onSuccess
  }: {
    operation: () => Promise<TResponse>
    successMessage?: string
    onSuccess?: () => void
  }) {
    try {
      const result = await operation()

      if (result.success) {
        // Show success message
        toast.success(successMessage || result.message)

        // Fetch updated tasks
        const updatedTasks = await getTasksByStatus({ projectId })
        if (updatedTasks?.data) {
          setTasks(updatedTasks.data)
        }

        // Reset UI state
        setIsUpdateTaskSheetOpen(false)
        setSelectedTask(null)

        // Execute additional success callback if provided
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error in task operation:', error)
      toast.error('Operation failed. Please try again!')
    }
  }

  // Simplified task handlers
  async function handleCreateTask(data: z.infer<typeof taskSchema>) {
    await handleTaskOperation({ operation: () => createTask({ ...data, projectId }) })
  }

  async function handleUpdateTask(data: z.infer<typeof taskSchema>) {
    if (!selectedTask) return

    await handleTaskOperation({
      operation: () => updateTask({ ...data, taskId: selectedTask.id }),
      onSuccess: () => {
        // Update the task in the UI
        const updatedTasks = { ...tasks }
        const taskStatus = selectedTask.status as keyof TasksByStatus
        const taskIndex = updatedTasks[taskStatus].findIndex(task => task.id === selectedTask.id)

        if (taskIndex !== -1) {
          // Remove from old status
          updatedTasks[taskStatus].splice(taskIndex, 1)

          // Add to new status
          const newStatus = data.status as keyof TasksByStatus
          updatedTasks[newStatus].push({
            ...selectedTask,
            ...data,
            files: data.files || []
          })

          setTasks(updatedTasks)
        }
      }
    })
  }

  async function handleDeleteTask(taskId: Task['id']) {
    if (!selectedTask || !taskId) return

    await handleTaskOperation({ operation: () => deleteTasks([taskId]) })
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColumn = source.droppableId as ColumnType
    const destinationColumn = destination.droppableId as ColumnType

    if (sourceColumn === destinationColumn && source.index === destination.index) return

    const newTasks = { ...tasks }
    const [movedTask] = newTasks[sourceColumn].splice(source.index, 1)
    // Get the Updated task's status before adding the new column
    const updatedTask = { ...movedTask, status: destinationColumn }

    newTasks[destinationColumn].splice(destination.index, 0, updatedTask)

    setTasks(newTasks)

    const response = await updateTaskStatus({ taskId: movedTask.id, status: destinationColumn })
    if (response.success) {
      toast.success(`Updated to ${destinationColumn}`)
    } else {
      toast.error('Failed to update task status')
      const revertTasks = { ...tasks }
      setTasks(revertTasks)
    }
  }

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setIsUpdateTaskSheetOpen(true)
  }

  async function handleUpdateProject(data: ProjectSchemaType) {
    try {
      const result = await updateProject(projectId, data)

      if (result.success) {
        const updatedProject = await getProjectById(projectId)
        if (updatedProject.success && updatedProject.data) {
          setProject(updatedProject.data)
        }

        toast.success(result.message)
        setIsProjectDialogOpen(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error in project update:', error)
      toast.error('Failed to update project. Please try again!')
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeTasks = async () => {
      setIsLoading(true)
      try {
        const result = await getTasksByStatus({ projectId })
        if (mounted && result?.data) {
          setTasks(result.data)
          setIsDragDropReady(true)
        }
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeTasks()

    // Cleanup function
    return () => {
      mounted = false
      setIsDragDropReady(false)
    }
  }, [projectId])

  return (
    <SidebarInset className='relative px-2'>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center w-full gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb className='flex-1'>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>
                  {tasksTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard/projects'>
                  {tasksTranslation('breadcrumb.projects')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>{tasksTranslation('breadcrumb.title')}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              {dashboardProjectsTranslation('extraActions')}
              <SettingsIcon className='w-4 h-4 ml-2' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='flex flex-col gap-y-1'>
            <DropdownMenuLink href='/dashboard/create-project' className='flex gap-x-4 rtl:rtl'>
              <ShoppingBagIcon className='w-5 h-5' />
              <span>{tasksTranslation('newProject')}</span>
            </DropdownMenuLink>

            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild className='text-green-50 bg-gray-700 hover:bg-gray-900'>
                <Button size='sm' className='flex gap-x-4 rtl:rtl'>
                  <PenBoxIcon className='w-5 h-5' />
                  {tasksTranslation('updateProject')}
                </Button>
              </DialogTrigger>
              <DialogContent className='md:max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>{tasksTranslation('updateProject')}</DialogTitle>
                  <DialogDescription>{tasksTranslation('updateProjectDetails')}</DialogDescription>
                </DialogHeader>
                <ProjectEdit
                  project={project}
                  onSubmit={handleUpdateProject}
                  onSuccess={() => setIsProjectDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <Drawer open={isUpdateTaskSheetOpen} onOpenChange={handleSheetOpenChange}>
          <DrawerTrigger asChild>
            <Button
              className='text-green-50 bg-green-600 hover:bg-green-900'
              onClick={() => setSelectedTask(null)}
            >
              <Notebook className='w-5 h-5' />
              <strong>{tasksTranslation('newTask.createTask')}</strong>
            </Button>
          </DrawerTrigger>
          <DrawerContent className='max-h-[95vh]'>
            <DrawerHeader>
              <DrawerTitle className='text-center md:text-2xl'>
                {selectedTask
                  ? tasksTranslation('updateTask')
                  : tasksTranslation('newTask.createTask')}
              </DrawerTitle>
              <DrawerDescription className='text-center'>
                {selectedTask
                  ? tasksTranslation('newTask.sheet.updateDescription')
                  : tasksTranslation('newTask.sheet.createDescription')}
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className='overflow-y-auto'>
              <TaskForm
                onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
                onSuccess={() => handleSheetOpenChange(false)}
                onDelete={handleDeleteTask}
                initialData={selectedTask || undefined}
                submitButtonText={
                  selectedTask
                    ? tasksTranslation('updateTask')
                    : tasksTranslation('newTask.createTask')
                }
                isEditing={!!selectedTask}
              />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </header>

      <section className='relative'>
        <main className='w-full overflow-x-auto'>
          <h1 className='text-xl text-center select-none my-3'>
            <strong className='border-double border-4 p-2'>{project?.name}</strong>
          </h1>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className='flex justify-start min-w-max'>
              <div className='grid grid-cols-3 gap-6 mt-5 mb-10'>
                <Column
                  title={tasksTranslation('pending')}
                  tasks={tasks.pending}
                  status='pending'
                  onViewDetails={handleViewDetails}
                  initialTasksCount={initialTasksCount}
                  isLoading={isLoading}
                  isDragDropReady={isDragDropReady}
                />
                <Column
                  title={tasksTranslation('inProgress')}
                  tasks={tasks['in-progress']}
                  status='in-progress'
                  onViewDetails={handleViewDetails}
                  initialTasksCount={initialTasksCount}
                  isLoading={isLoading}
                  isDragDropReady={isDragDropReady}
                />
                <Column
                  title={tasksTranslation('completed')}
                  tasks={tasks.completed}
                  status='completed'
                  onViewDetails={handleViewDetails}
                  initialTasksCount={initialTasksCount}
                  isLoading={isLoading}
                  isDragDropReady={isDragDropReady}
                />
              </div>
            </div>
          </DragDropContext>
        </main>
        <div className='absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent pointer-events-none' />
        <div className='absolute -right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-neutral-950  to-transparent pointer-events-none' />
      </section>
    </SidebarInset>
  )
}
