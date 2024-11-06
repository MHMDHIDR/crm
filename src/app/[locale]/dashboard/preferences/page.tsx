import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import LanguageSelector from './language-selector'
import ThemeSwitch from './theme-switch'

export default async function DashboardPreferencesPage() {
  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex gap-2 items-center'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Preferences</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className='container pb-10'>
        <div className='p-4 shadow rounded-lg space-y-8'>
          <ThemeSwitch />

          <LanguageSelector />
        </div>
      </main>
    </SidebarInset>
  )
}
