import { getProjectById } from '@/actions/projects/get-project'
import { getTasksByStatus } from '@/actions/tasks/get-task'
import ProjectTasksClientPage from '@/app/dashboard/projects/[projectId]/project-tasks.client'

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  const [projectResult, tasksByStatus] = await Promise.all([
    getProjectById(projectId),
    getTasksByStatus({ projectId })
  ])

  const tasksCount = {
    pending: tasksByStatus.data?.pending.length ?? 0,
    inProgress: tasksByStatus.data?.['in-progress'].length ?? 0,
    completed: tasksByStatus.data?.completed.length ?? 0
  }

  return (
    <ProjectTasksClientPage
      projectId={projectId}
      initialProject={projectResult.data}
      initialTasksCount={tasksCount}
    />
  )
}
