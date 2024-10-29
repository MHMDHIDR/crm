import { notFound } from 'next/navigation'
import { auth } from '@/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || !session.user) {
    notFound()
  }

  return (
    <main className='pt-10 flex flex-col md:flex-row'>
      {/* <DashboardSidebar user={session.user} /> */}

      <h1 className='relative z-20 py-2 mx-auto mt-6 text-2xl font-semibold text-center bg-clip-text bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white'>
        Welcome, {session.user.name}
      </h1>

      {children}
    </main>
  )
}
