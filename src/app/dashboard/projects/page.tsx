import { getTranslations } from 'next-intl/server'
import ProjectsClientPage from '@/app/dashboard/projects/projects.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.projects')

  return {
    title: `${translations('title')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function ProjectsPage() {
  return <ProjectsClientPage />
}
