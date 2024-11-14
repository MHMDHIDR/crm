import { FileUser, LucideIcon, ShoppingBagIcon, UserCheck, Users } from 'lucide-react'
import { getClientsByEmployeeId } from '@/actions/clients/get-clients'
import { getProjectsByEmployeeId } from '@/actions/projects/get-project'
import {
  getActiveEmployees,
  getSupervisorEmployeeStats
} from '@/actions/supervisor/get-supervisor-stats.ts'
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
import type { ActiveEmployee } from '@/actions/supervisor/get-supervisor-stats.ts'

type DashboardDataProps =
  | {
      ClientsCount: number
      ProjectsCount: number
    }
  | {
      activeEmployees: ActiveEmployee[]
      stats: {
        totalEmployees: number
        totalProjects: number
        totalTasks: number
        totalClients: number
      }
    }
  | {}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user.id) return null
  const user = session.user

  let dashboardData: DashboardDataProps = {}

  if (user.role === 'Employee') {
    const { count: ClientsCount } = await getClientsByEmployeeId(user.id)
    const { count: ProjectsCount } = await getProjectsByEmployeeId(user.id)
    dashboardData = { ClientsCount, ProjectsCount }
  } else if (['Admin', 'Supervisor'].includes(user.role)) {
    const { data: activeEmployees } = await getActiveEmployees(user.id)
    const { data: stats } = await getSupervisorEmployeeStats(user.id)
    dashboardData = { activeEmployees, stats }
  }

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
          {user.role === 'Employee' ? (
            <>
              <MetricCard
                title='Clients'
                value={(dashboardData as any).ClientsCount}
                icon={FileUser}
              />
              <MetricCard
                title='Projects'
                value={(dashboardData as any).ProjectsCount}
                icon={ShoppingBagIcon}
              />
            </>
          ) : ['Admin', 'Supervisor'].includes(user.role) ? (
            <>
              <MetricCard
                title='Active Employees'
                value={(dashboardData as any).activeEmployees?.length || 0}
                icon={UserCheck}
              >
                <div className='mt-4 space-y-2'>
                  {(dashboardData as any).activeEmployees?.map((employee: any) => (
                    <div key={employee.id} className='text-sm'>
                      {employee.name} - {new Date(employee.signedInAt).toLocaleTimeString()}
                    </div>
                  ))}
                </div>
              </MetricCard>
              <MetricCard
                title='Total Employees'
                value={(dashboardData as any).stats?.totalEmployees || 0}
                icon={Users}
              />
              <MetricCard
                title='Employees Projects'
                value={(dashboardData as any).stats?.totalProjects || 0}
                icon={ShoppingBagIcon}
                subValue={`Tasks: ${(dashboardData as any).stats?.totalTasks || 0}`}
              />
              <MetricCard
                title='Total Employee Clients'
                value={(dashboardData as any).stats?.totalClients || 0}
                icon={FileUser}
              />
            </>
          ) : null}
        </div>
        <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
      </div>
    </SidebarInset>
  )
}

type MetricCardProps = {
  title: string
  value: number
  icon: LucideIcon
  subValue?: string | React.ReactNode
  children?: React.ReactNode
}

const MetricCard = ({ title, value, icon: Icon, subValue, children }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='w-10 h-10 stroke-1' />
      </CardHeader>
      <CardContent>
        <h4 className='text-2xl font-bold'>{value}</h4>
        {subValue && <p className='text-sm text-muted-foreground mt-2'>{subValue}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
