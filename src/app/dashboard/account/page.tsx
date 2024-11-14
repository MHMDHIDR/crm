import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { UserSession } from '@/db/schema'
import { env } from '@/env'
import AccountClientPage from './account.client'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.settings')

  return {
    title: `${translations('account')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function AccountPage() {
  const session = await auth()

  const user = session?.user as UserSession

  return <AccountClientPage user={user} />
}
