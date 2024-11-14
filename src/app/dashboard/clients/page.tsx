import { getTranslations } from 'next-intl/server'
import ClientsPageClient from '@/app/dashboard/clients/clients.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.clients')

  return {
    title: `${translations('title')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function ClientsPage() {
  return <ClientsPageClient />
}
