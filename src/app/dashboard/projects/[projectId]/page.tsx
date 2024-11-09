import { getTasksByStatus } from '@/actions/tasks/get-task'
import ProjectTasksClientPage from '@/app/dashboard/projects/[projectId]/projects-tasks.client'

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  const { data: tasksByStatus } = await getTasksByStatus({ projectId })

  console.log(tasksByStatus)

  // Calculate the count for each status
  const tasksCount = {
    pending: tasksByStatus?.pending.length ?? 0,
    inProgress: tasksByStatus?.['in-progress'].length ?? 0,
    completed: tasksByStatus?.completed.length ?? 0
  }

  return <ProjectTasksClientPage projectId={projectId} initialTasksCount={tasksCount} />
}
