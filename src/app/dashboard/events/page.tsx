import { getTranslations } from 'next-intl/server'
import EventsPageClient from '@/app/dashboard/events/events.client'
import { env } from '@/env'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.events')

  return {
    title: `${translations('title')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default function EventsPage() {
  return <EventsPageClient />
}
