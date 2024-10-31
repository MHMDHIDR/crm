import { getUserTheme } from '@/actions/user-theme'
import ThemeSwitch from './theme-switch'

export default async function DashboardPreferencesPage() {
  const userTheme = await getUserTheme()

  return (
    <main className='container pb-10'>
      <div className='p-4 shadow rounded-lg'>
        <h2 className='text-lg font-bold mb-4'>Select your preferred theme 😎</h2>

        <ThemeSwitch currentTheme={userTheme} />
      </div>
    </main>
  )
}
