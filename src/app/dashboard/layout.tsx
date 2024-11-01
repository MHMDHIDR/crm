import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardSidebar } from '@/components/custom/dashboard-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || !session.user) notFound()

  return (
    <SidebarProvider>
      <DashboardSidebar user={session.user} />

      <main className='flex-1 px-2.5 container w-full mx-auto'>
        <h1 className='relative z-20 py-2 mx-auto my-6 text-2xl font-semibold text-center bg-clip-text bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white'>
          Welcome, {session.user.name}
        </h1>
        <section className='mx-auto max-w-3xl'>{children}</section>
      </main>
    </SidebarProvider>
  )
}
