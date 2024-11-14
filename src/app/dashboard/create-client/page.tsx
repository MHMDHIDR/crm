import { getTranslations } from 'next-intl/server'
import CreateClientClientPage from '@/app/dashboard/create-client/create-client.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.clients')

  return {
    title: `${translations('createClient')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function CreateClientPage() {
  return <CreateClientClientPage />
}
