import { getTranslations } from 'next-intl/server'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { env } from '@/env'
import LanguageSelector from './language-selector'
import ThemeSwitch from './theme-switch'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('DashboardSidebar.settings')

  return {
    title: `${translations('preferences')} | ${env.NEXT_PUBLIC_APP_NAME}`,
    description: env.NEXT_PUBLIC_APP_DESCRIPTION
  }
}

export default async function DashboardPreferencesPage() {
  const dashboardPreferencesTranslation = await getTranslations('dashboard.preferences')

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                {dashboardPreferencesTranslation('breadcrumb.dashboard')}
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {dashboardPreferencesTranslation('breadcrumb.preferences')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className='container pb-10'>
        <div className='p-4 rounded-lg shadow space-y-8'>
          <ThemeSwitch />

          <LanguageSelector />
        </div>
      </main>
    </SidebarInset>
  )
}
