'use client'

import { Notebook, ShoppingBagIcon } from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { z } from 'zod'
import { createTask } from '@/actions/tasks/create-task'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { taskSchema } from '@/validators/task'
import type { Task, TasksByStatus } from '@/db/schema'

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
  projectId: string
  /** Used to Render the correct Loading Cards inside the column, to get a sense of the correct layout */
  initialTasksCount: {
    pending: number
    inProgress: number
    completed: number
  }
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
  return (
    <Card
      className={cn(
        'rounded-lg cursor-grab dark:hover:border-rose-900 hover:border-rose-200 hover:border-dashed hover:shadow-md',
        className
      )}
    >
      <CardContent onClick={() => onViewDetails(task)} className='p-2'>
        <h3 className='text-lg font-semibold'>{task.title}</h3>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>
          {task.description}
        </p>
        <div className='mt-4'>
          <span className='text-sm text-gray-500'>
            Due: {formatDate(String(task.dueDate), false)}
          </span>
        </div>
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

  return (
    <Card className='bg-slate-50 dark:bg-slate-950 max-h-fit'>
      <CardHeader className='px-4 pb-1'>
        <CardTitle>
          {title}
          <Badge
            className='ml-2 rounded-full'
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
                  className='min-w-[21rem] h-28'
                />
              ) : (
                !isLoading &&
                tasks.length === 0 && (
                  //Important: Adding this to allow to drag items when the column has no TaskCards rendered inside it!
                  <div className='text-sm text-gray-400 text-center min-w-[21rem]'>No Tasks</div>
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
  initialTasksCount
}: ProjectTasksClientPageProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <SidebarInset className='relative px-2'>
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
              <BreadcrumbItem>Tasks</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className='font-bold'>
              <Notebook className='w-5 h-5 mr-2' />
              <span>{selectedTask ? 'Update Task' : 'Create Task'}</span>
            </Button>
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

        <Link href='/dashboard/create-project'>
          <Button>
            <ShoppingBagIcon className='w-5 h-5 mr-2' />
            <span>Add New Project</span>
          </Button>
        </Link>
      </header>

      <main className='w-full overflow-x-auto'>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className='flex justify-start min-w-max'>
            <div className='grid grid-cols-3 gap-6 mt-5 mb-10'>
              <Column
                title='Pending'
                tasks={tasks.pending}
                status='pending'
                onViewDetails={handleViewDetails}
                initialTasksCount={initialTasksCount}
                isLoading={isLoading}
              />
              <Column
                title='In Progress'
                tasks={tasks['in-progress']}
                status='in-progress'
                onViewDetails={handleViewDetails}
                initialTasksCount={initialTasksCount}
                isLoading={isLoading}
              />
              <Column
                title='Completed'
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
