import { getTasksByStatus } from '@/actions/tasks/get-task'
import { TasksByStatus } from '@/db/schema'
import ProjectTasksClientPage from './project-tasks.client'

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const { data: tasks } = await getTasksByStatus({ projectId })

  return <ProjectTasksClientPage projectId={projectId} initialTasks={tasks as TasksByStatus} />
}
