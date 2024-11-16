'use client'

import { Notebook, PenBoxIcon, SettingsIcon, ShoppingBagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLink,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/cn'
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

  return (
    <Card
      className={cn(
        'relative rounded-lg cursor-grab dark:hover:border-rose-900 hover:border-rose-200 hover:border-dashed hover:shadow-md min-w-80 max-w-[21rem] h-28 overflow-hidden',
        className
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
        <Droppable
          droppableId={status}
          isDropDisabled={false}
          isCombineEnabled={false}
          direction='vertical'
          ignoreContainerClipping={false}
        >
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='space-y-2 overflow-x-hidden'
            >
              {isLoading ? (
                <LoadingCard
                  renderedSkeletons={getSkeletonCount()}
                  className='min-w-80 max-w-[21rem] h-28'
                />
              ) : (
                !isLoading &&
                tasks.length === 0 && (
                  //IMPORTANT: Adding this to allow to drag items when the column has no TaskCards rendered inside it!
                  <div className='text-sm text-gray-400 text-center min-w-[21rem]'>
                    {tasksTranslation('noTasks')}
                  </div>
                )
              )}
              {tasks.map((task, index) => (
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
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  )
}

export default function ProjectTasksClientPage({
  projectId,
  initialProject,
  initialTasksCount
}: ProjectTasksClientPageProps) {
  const tasksTranslation = useTranslations('dashboard.tasks')

  const [project, setProject] = useState<ExtendedProject | undefined>(initialProject)
  const [isUpdateTaskSheetOpen, setIsUpdateTaskSheetOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<TasksByStatus>({
    pending: [],
    'in-progress': [],
    completed: []
  })

  const dashboardProjectsTranslation = useTranslations('dashboard.dataTable.tableToolbar')
  const toast = useToast()

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

    await handleTaskOperation({ operation: () => updateTask({ ...data, taskId: selectedTask.id }) })
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
    setIsUpdateTaskSheetOpen(true)
  }

  useEffect(() => {
    setIsLoading(true)
    const initializeTasks = async () => {
      const result = await getTasksByStatus({ projectId })
      if (result?.data) {
        setTasks(result.data)

        setIsLoading(false)
      }
    }
    initializeTasks()
  }, [projectId])

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
              <BreadcrumbItem>{tasksTranslation('breadcrumb.title')}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              {dashboardProjectsTranslation('bulkActions')}
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

        <Sheet open={isUpdateTaskSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button
              className='text-green-50 bg-green-600 hover:bg-green-900'
              onClick={() => setSelectedTask(null)}
            >
              <Notebook className='w-5 h-5' />
              <strong>{tasksTranslation('newTask.createTask')}</strong>
            </Button>
          </SheetTrigger>
          <SheetContent side='bottom'>
            <SheetHeader>
              <SheetTitle className='text-center md:text-2xl'>
                {selectedTask
                  ? tasksTranslation('updateTask')
                  : tasksTranslation('newTask.createTask')}
              </SheetTitle>
              <SheetDescription className='text-center'>
                {selectedTask
                  ? tasksTranslation('newTask.sheet.updateDescription')
                  : tasksTranslation('newTask.sheet.createDescription')}
              </SheetDescription>
            </SheetHeader>
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
          </SheetContent>
        </Sheet>
      </header>

      <main className='w-full overflow-x-auto'>
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
              />
              <Column
                title={tasksTranslation('inProgress')}
                tasks={tasks['in-progress']}
                status='in-progress'
                onViewDetails={handleViewDetails}
                initialTasksCount={initialTasksCount}
                isLoading={isLoading}
              />
              <Column
                title={tasksTranslation('completed')}
                tasks={tasks.completed}
                status='completed'
                onViewDetails={handleViewDetails}
                initialTasksCount={initialTasksCount}
                isLoading={isLoading}
              />
            </div>
          </div>
        </DragDropContext>
      </main>

      <div className='absolute top-0 bottom-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-white dark:from-neutral-950 to-transparent' />
      <div className='absolute top-0 bottom-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-white dark:from-neutral-950 to-transparent' />
    </SidebarInset>
  )
}
