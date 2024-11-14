import { getTranslations } from 'next-intl/server'
import CreateProjectClientPage from '@/app/dashboard/create-project/create-project.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.projects')

  return {
    title: `${translations('createProject')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function CreateProjectPage() {
  return <CreateProjectClientPage />
}
