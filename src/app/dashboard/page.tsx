import { FileUser, ShoppingBagIcon } from 'lucide-react'
import { getClientsByEmployeeId } from '@/actions/clients/get-clients'
import { getProjectsByEmployeeId } from '@/actions/projects/get-project'
import { auth } from '@/auth'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user.id) return null

  const user = session.user

  const { count: ClientsCount } = await getClientsByEmployeeId(user.id)
  const { count: ProjectsCount } = await getProjectsByEmployeeId(user.id)

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center px-4 gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className='flex flex-col flex-1 p-4 pt-0 gap-4'>
        <div className='grid auto-rows-min gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Clients</CardTitle>
              <FileUser className='w-10 h-10 stroke-1' />
            </CardHeader>
            <CardContent>
              <h4 className='text-2xl font-bold'>{ClientsCount}</h4>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Projects</CardTitle>
              <ShoppingBagIcon className='w-10 h-10 stroke-1' />
            </CardHeader>
            <CardContent>
              <h4 className='text-2xl font-bold'>{ProjectsCount}</h4>
            </CardContent>
          </Card>
        </div>
        <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
      </div>
    </SidebarInset>
  )
}
