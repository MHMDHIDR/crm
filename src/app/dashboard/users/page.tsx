import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { env } from '@/env'
import UsersClientPage from './users.client'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.users')

  return {
    title: `${translations('title')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function UsersPage() {
  const session = await auth()

  return !session || !session.user || session.user.role !== 'Admin' ? (
    notFound()
  ) : (
    <UsersClientPage />
  )
}
