import { getLocale } from 'next-intl/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getProjectsByEmployeeId } from '@/actions/projects/get-project'
import { getUserLanguage } from '@/actions/users/user-language'
import { auth } from '@/auth'
import { DashboardSidebar } from '@/components/custom/dashboard-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { UserSession } from '@/db/schema'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || !session.user) notFound()

  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar:state')?.value
  const initialSidebarOpen = sidebarState === 'true'

  // Get employee projects
  const projects = await getProjectsByEmployeeId(session.user.id)

  const language = await getUserLanguage()
  const locale = language ?? (await getLocale())

  return (
    <SidebarProvider defaultOpen={initialSidebarOpen}>
      <DashboardSidebar user={session?.user as UserSession} projects={projects} locale={locale} />

      <main className='flex-1 px-2.5 container w-full mx-auto'>
        <h1 className='relative z-20 py-2 mx-auto my-6 text-2xl font-semibold text-center bg-clip-text bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white'>
          Welcome, {session.user.name}
        </h1>
        <section className='max-w-screen-xl mx-auto'>{children}</section>
      </main>
    </SidebarProvider>
  )
}
