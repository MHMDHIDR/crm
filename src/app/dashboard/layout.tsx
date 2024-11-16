import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { checkUserDeadlines } from '@/actions/notifications/deadline'
import { getUnreadNotificationsCount } from '@/actions/notifications/notifications'
import { getProjectsByEmployeeId } from '@/actions/projects/get-project'
import { auth } from '@/auth'
import { DashboardSidebar } from '@/components/custom/dashboard-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { env } from '@/env'
import type { UserSession } from '@/db/schema'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.labels.pinned')

  return {
    title: `${translations('dashboard')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || !session.user) notFound()

  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar:state')?.value
  const initialSidebarOpen = sidebarState === 'true'

  // Get employee projects
  const { projectsByEmployeeId } = await getProjectsByEmployeeId(session.user.id)
  const { count: unreadNotificationsCount } = await getUnreadNotificationsCount()

  await checkUserDeadlines(session.user.id)

  return (
    <SidebarProvider defaultOpen={initialSidebarOpen}>
      <DashboardSidebar
        user={session?.user as UserSession}
        projects={projectsByEmployeeId}
        notificationsCount={unreadNotificationsCount}
      />

      <main className='flex-1 px-2.5 container w-full max-w-screen-lg mx-auto'>
        <h1 className='relative z-20 py-2 mx-auto my-6 text-2xl font-semibold text-center bg-clip-text bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white'>
          Welcome, {session.user.name}
        </h1>
        <section>{children}</section>
      </main>
    </SidebarProvider>
  )
}
