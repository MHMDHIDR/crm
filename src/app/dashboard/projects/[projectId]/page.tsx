import { getProjectById } from '@/actions/projects/get-project'
import { getTasksByStatus } from '@/actions/tasks/get-task'
import ProjectTasksClientPage from '@/app/dashboard/projects/[projectId]/project-tasks.client'
import { env } from '@/env'
import type { Project } from '@/db/schema'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ projectId: Project['id'] }>
}): Promise<Metadata> {
  const { projectId } = await params
  const { data: project } = await getProjectById(projectId)

  return {
    title: `${project?.name} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function ProjectTasksPage({
  params
}: {
  params: Promise<{ projectId: Project['id'] }>
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
