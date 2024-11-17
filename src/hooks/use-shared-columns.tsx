import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Ban, CheckCircle, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Event, ExtendedProject, Project } from '@/db/schema'
import { Link } from '@/i18n/routing'
import { clsx } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { useLocale } from '@/providers/locale-provider'
import type { DataTableFilterField } from '@/components/custom/data-table/data-table-faceted-filter'

type BaseEntity = {
  id: string
  email: string
  name: string
}

// Define specific interfaces for User and Client
type User = BaseEntity & {
  role: 'Admin' | 'Supervisor' | 'Employee'
  emailVerified: boolean | null
  suspendedAt: Date | null
  supervisor: User
}

type Client = BaseEntity & {
  status: 'active' | 'deactivated'
}

// Define the actions that can be performed
type TableActions = {
  onDelete?: (id: string) => void
  onSuspend?: (id: string) => void
  onUnsuspend?: (id: string) => void
  onActivate?: (id: string) => void
  onDeactivate?: (id: string) => void
  basePath: '/projects' | '/users' | '/clients' | '/events'
}

type SharedColumnsProps<T extends BaseEntity | ExtendedProject | Event> = {
  entityType: 'users' | 'clients' | 'project' | 'events'
  actions: TableActions
}

type entityTypes = 'users' | 'clients' | 'project' | 'events'

/* eslint-disable max-lines */
export function useSharedColumns<T extends BaseEntity | ExtendedProject | Event>({
  entityType,
  actions
}: SharedColumnsProps<T>): {
  columns: ColumnDef<T>[]
  filterFields: DataTableFilterField<T>[]
} {
  const dashboardDataTableTranslations = useTranslations('dashboard.dataTable.columns')
  const { locale } = useLocale()

  function getViewEditLabel(entityType: Omit<entityTypes, 'events'>): string {
    return dashboardDataTableTranslations(
      `actions.viewEdit.${entityType === 'users' ? 'user' : entityType === 'clients' ? 'client' : 'project'}`
    )
  }

  function getDeleteLabel(entityType: Omit<entityTypes, 'events'>): string {
    return dashboardDataTableTranslations(
      `actions.delete.${entityType === 'users' ? 'user' : entityType === 'clients' ? 'client' : 'project'}`
    )
  }

  const filterFields: DataTableFilterField<T>[] = [
    // For users
    ...(entityType === 'users'
      ? [
          {
            id: 'role',
            label: dashboardDataTableTranslations('headers.userRole'),
            options: [
              { label: 'Admin', value: 'Admin' },
              { label: 'Supervisor', value: 'Supervisor' },
              { label: 'Employee', value: 'Employee' }
            ]
          },
          {
            id: 'emailVerified',
            label: dashboardDataTableTranslations('headers.verifiedStatus'),
            options: [
              {
                label: dashboardDataTableTranslations('status.verified'),
                value: 'true'
              },
              {
                label: dashboardDataTableTranslations('status.pending'),
                value: 'false'
              }
            ]
          }
        ]
      : []),
    // For clients
    ...(entityType === 'clients'
      ? [
          {
            id: 'status',
            label: dashboardDataTableTranslations('headers.status'),
            options: [
              {
                label: dashboardDataTableTranslations('status.active'),
                value: 'active'
              },
              {
                label: dashboardDataTableTranslations('status.deactivated'),
                value: 'deactivated'
              }
            ]
          }
        ]
      : []),
    // For projects
    ...(entityType === 'project'
      ? [
          {
            id: 'status',
            label: dashboardDataTableTranslations('headers.status'),
            options: [
              {
                label: dashboardDataTableTranslations('status.active'),
                value: 'active'
              },
              {
                label: dashboardDataTableTranslations('status.deactivated'),
                value: 'deactivated'
              }
            ]
          }
        ]
      : []),
    // For events
    ...(entityType === 'events'
      ? [
          {
            id: 'userRole',
            label: dashboardDataTableTranslations('headers.userRole'),
            options: [
              { label: 'Admin', value: 'Admin' },
              { label: 'Supervisor', value: 'Supervisor' },
              { label: 'Employee', value: 'Employee' }
            ]
          }
        ]
      : [])
  ]

  const baseColumns: ColumnDef<T>[] = ['project', 'clients', 'users'].includes(entityType)
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label={dashboardDataTableTranslations('select.aria')}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              aria-label={dashboardDataTableTranslations('select.rowAria')}
            />
          ),
          enableSorting: false,
          enableHiding: false
        },
        {
          accessorKey: 'name',
          header: ({ column }) => (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {dashboardDataTableTranslations('headers.name')}
              <ArrowUpDown className='w-4 h-4 ml-2' />
            </Button>
          )
        }
      ]
    : []

  const usersColumns: ColumnDef<T>[] = [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.email')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`${actions.basePath}/${row.original.id}`} className='hover:underline'>
          {row.getValue('email')}
        </Link>
      )
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.role')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const role = (row.original as unknown as User).role
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': role === 'Admin',
              'text-orange-600 bg-orange-50': role === 'Supervisor',
              'text-blue-600 bg-blue-50': role === 'Employee'
            })}
          >
            {role}
          </span>
        )
      },
      filterFn: (row, _id, filterValues: string[]) => {
        const value = (row.original as unknown as User).role
        return filterValues.includes(value)
      }
    },
    {
      accessorKey: 'supervisor',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.supervisor')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const supervisor = (row.original as unknown as User).supervisor
        return (
          <span className='rounded-full px-2.5 py-0.5 border select-none'>{supervisor.name}</span>
        )
      }
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.verifiedStatus')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const emailVerified = (row.original as unknown as User).emailVerified
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': emailVerified !== null,
              'text-red-600 bg-red-50': emailVerified === null
            })}
          >
            {emailVerified
              ? dashboardDataTableTranslations('status.verified')
              : dashboardDataTableTranslations('status.pending')}
          </span>
        )
      },
      filterFn: (row, _id, filterValues: string[]) => {
        const value = (row.original as unknown as User).emailVerified !== null ? 'true' : 'false'
        return filterValues.includes(value)
      }
    },
    {
      accessorKey: 'suspendedAt',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.suspendedStatus')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const suspendedAt = (row.original as unknown as User).suspendedAt
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': suspendedAt === null,
              'text-red-600 bg-red-50': suspendedAt !== null
            })}
          >
            {suspendedAt
              ? formatDate({ date: String(suspendedAt), locale })
              : dashboardDataTableTranslations('status.active')}
          </span>
        )
      }
    }
  ]

  const clientsColumns: ColumnDef<T>[] = [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.email')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`${actions.basePath}/${row.original.id}`} className='hover:underline'>
          {row.getValue('email')}
        </Link>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.status')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const status = (row.original as unknown as Client).status
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': status === 'active',
              'text-red-600 dark:text-red-200 bg-red-50': status === 'deactivated'
            })}
          >
            {dashboardDataTableTranslations(
              status === 'active' ? 'status.active' : 'status.deactivated'
            )}
          </span>
        )
      },
      filterFn: (row, _id, filterValues: string[]) => {
        const value = (row.original as unknown as Client).status
        return filterValues.includes(value)
      }
    }
  ]

  const projectsColumns: ColumnDef<T>[] = [
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.status')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const status = (row.original as ExtendedProject).status
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': status === 'active',
              'text-red-600 bg-red-50': status === 'deactivated'
            })}
          >
            {dashboardDataTableTranslations(
              status === 'active' ? 'status.active' : 'status.deactivated'
            )}
          </span>
        )
      },
      filterFn: (row, _id, filterValues: string[]) => {
        const value = (row.original as unknown as ExtendedProject).status
        return filterValues.includes(value)
      }
    },
    {
      accessorKey: 'clientName',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.clientName')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const clientName = (row.original as ExtendedProject).clientName
        return <span className='truncate'>{clientName}</span>
      }
    },
    {
      accessorKey: 'assignedEmployee',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.assignedEmployee')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const assignedEmployeeName = (row.original as ExtendedProject).assignedEmployeeName
        return <span className='truncate'>{assignedEmployeeName}</span>
      }
    },
    {
      accessorKey: 'description',
      header: dashboardDataTableTranslations('headers.description'),
      cell: ({ row }) => {
        const description = (row.original as ExtendedProject).description || ''
        const MAX_LENGTH = 30
        return (
          <span className='truncate' title={description}>
            {description.length > MAX_LENGTH
              ? `${description.substring(0, MAX_LENGTH)}...`
              : description}
          </span>
        )
      }
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.startDate')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const startDate = (row.original as ExtendedProject).startDate
        return <span>{formatDate({ date: String(startDate), locale })}</span>
      }
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.endDate')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const endDate = (row.original as ExtendedProject).endDate
        return <span>{formatDate({ date: String(endDate), locale })}</span>
      }
    }
  ]

  const eventColumns: ColumnDef<Event>[] = [
    {
      accessorKey: 'userName',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.userName')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      )
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.description')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      )
    },
    {
      accessorKey: 'userRole',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.userRole')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const userRole = row.original.userRole
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-50': userRole === 'Admin',
              'text-orange-600 bg-orange-50': userRole === 'Supervisor',
              'text-blue-600 bg-blue-50': userRole === 'Employee'
            })}
          >
            {userRole}
          </span>
        )
      },
      filterFn: (row, _id, filterValues: string[]) => {
        const value = (row.original as unknown as Event).userRole
        return filterValues.includes(value)
      }
    },
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dashboardDataTableTranslations('headers.timestamp')}
          <ArrowUpDown className='w-4 h-4 ml-2' />
        </Button>
      ),
      cell: ({ row }) => {
        const timestamp = row.original.timestamp
        return <span>{formatDate({ date: String(timestamp), locale, isFullTimestamp: true })}</span>
      }
    }
  ]

  const actionsColumn: ColumnDef<T> = {
    id: 'actions',
    header: dashboardDataTableTranslations('headers.action'),
    cell: ({ row }) => {
      const entity = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='w-8 h-8 p-0'>
              <span className='sr-only'>{dashboardDataTableTranslations('actions.label')}</span>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='rtl:rtl'>
            <DropdownMenuLabel className='select-none'>
              {dashboardDataTableTranslations('actions.label')}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard${actions.basePath}/${entity.id}`}>
                <Pencil className='mr-0.5 h-4 w-4' />
                {getViewEditLabel(entityType)}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {entityType === 'users' && actions.onSuspend && actions.onUnsuspend && (
              <DropdownMenuItem
                className={clsx({
                  'text-red-600': !(row.original as User).suspendedAt,
                  'text-green-600': (row.original as User).suspendedAt
                })}
                onClick={() =>
                  (row.original as unknown as User).suspendedAt
                    ? actions.onUnsuspend?.(entity.id)
                    : actions.onSuspend?.(entity.id)
                }
              >
                <Ban className='mr-0.5 h-4 w-4' />
                {(row.original as unknown as User).suspendedAt
                  ? dashboardDataTableTranslations('actions.suspend.unsuspend')
                  : dashboardDataTableTranslations('actions.suspend.suspend')}
              </DropdownMenuItem>
            )}
            {['project', 'clients'].includes(entityType) &&
              actions.onActivate &&
              actions.onDeactivate && (
                <DropdownMenuItem
                  className={clsx({
                    'text-green-600':
                      (row.original as Project).status === 'deactivated' ||
                      (row.original as Client).status === 'deactivated',
                    'text-red-600':
                      (row.original as Project).status === 'active' ||
                      (row.original as Client).status === 'active'
                  })}
                  onClick={() =>
                    ((row.original as unknown as Project) || (row.original as unknown as Client))
                      .status === 'deactivated'
                      ? actions.onActivate?.(entity.id)
                      : actions.onDeactivate?.(entity.id)
                  }
                >
                  {((row.original as unknown as Project) || (row.original as unknown as Client))
                    .status === 'deactivated' ? (
                    <>
                      <CheckCircle className='mr-0.5 h-4 w-4' />
                      {entityType === 'project'
                        ? dashboardDataTableTranslations('actions.status.activate.project')
                        : dashboardDataTableTranslations('actions.status.activate.client')}
                    </>
                  ) : (
                    <>
                      <Ban className='mr-0.5 h-4 w-4' />
                      {entityType === 'project'
                        ? dashboardDataTableTranslations('actions.status.deactivated.project')
                        : dashboardDataTableTranslations('actions.status.deactivated.client')}
                    </>
                  )}
                </DropdownMenuItem>
              )}
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => actions.onDelete?.(entity.id)}
            >
              <Trash className='mr-0.5 h-4 w-4' />
              {getDeleteLabel(entityType)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  // Combine columns based on entity type
  return {
    columns: [
      ...baseColumns,
      ...(entityType === 'users'
        ? [...usersColumns, actionsColumn]
        : entityType === 'clients'
          ? [...clientsColumns, actionsColumn]
          : entityType === 'project'
            ? [...projectsColumns, actionsColumn]
            : entityType === 'events'
              ? eventColumns
              : [])
    ] as ColumnDef<T>[],
    filterFields
  }
}
