import { getTranslations } from 'next-intl/server'
import CreateUserClientPage from '@/app/dashboard/create-user/create-user.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.users')

  return {
    title: `${translations('createUser')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function CreateUserPage() {
  return <CreateUserClientPage />
}
