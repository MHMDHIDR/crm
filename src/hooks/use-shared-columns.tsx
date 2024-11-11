import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Ban, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
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
import { ExtendedProject } from '@/db/schema'
import { clsx } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'

// Define base entity interface that both User and Client will extend
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
}

type Client = BaseEntity & {
  status: 'active' | 'deactive'
}

// Define the actions that can be performed
type TableActions = {
  onDelete: (id: string) => void
  onSuspend?: (id: string) => void
  onUnsuspend?: (id: string) => void
  onActivate?: (id: string) => void
  onDeactivate?: (id: string) => void
  basePath: string
}

type SharedColumnsProps<T extends BaseEntity | ExtendedProject> = {
  entityType: 'users' | 'clients' | 'project'
  actions: TableActions
}

export function useSharedColumns<T extends BaseEntity | ExtendedProject>({
  entityType,
  actions
}: SharedColumnsProps<T>): ColumnDef<T>[] {
  const dashboardDataTableTranslations = useTranslations('dashboard.dataTable.columns')

  function getViewEditLabel(entityType: 'users' | 'clients' | 'project'): string {
    return dashboardDataTableTranslations(
      `actions.viewEdit.${entityType === 'users' ? 'user' : entityType === 'clients' ? 'client' : 'project'}`
    )
  }

  function getDeleteLabel(entityType: 'users' | 'clients' | 'project'): string {
    return dashboardDataTableTranslations(
      `actions.delete.${entityType === 'users' ? 'user' : entityType === 'clients' ? 'client' : 'project'}`
    )
  }

  const baseColumns: ColumnDef<T>[] = [
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

  // User-specific columns
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
              'text-green-600 bg-green-100': role === 'Admin',
              'text-orange-600 bg-orange-100': role === 'Supervisor',
              'text-blue-600 bg-blue-100': role === 'Employee'
            })}
          >
            {role}
          </span>
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
              'text-green-600 bg-green-100': emailVerified !== null,
              'text-red-600 bg-red-100': emailVerified === null
            })}
          >
            {emailVerified
              ? dashboardDataTableTranslations('status.verified')
              : dashboardDataTableTranslations('status.pending')}
          </span>
        )
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
              'text-green-600 bg-green-100': suspendedAt === null,
              'text-red-600 bg-red-100': suspendedAt !== null
            })}
          >
            {suspendedAt
              ? formatDate(String(suspendedAt))
              : dashboardDataTableTranslations('status.active')}
          </span>
        )
      }
    }
  ]

  // Client-specific columns
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
              'text-green-600 bg-green-100': status === 'active',
              'text-red-600 bg-red-100': status === 'deactive'
            })}
          >
            {dashboardDataTableTranslations(
              status === 'active' ? 'status.active' : 'status.deactive'
            )}
          </span>
        )
      }
    }
  ]

  // Project-specific columns
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
              'text-green-600 bg-green-100': status === 'active',
              'text-red-600 bg-red-100': status === 'deactive'
            })}
          >
            {dashboardDataTableTranslations(
              status === 'active' ? 'status.active' : 'status.deactive'
            )}
          </span>
        )
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
        const description = (row.original as ExtendedProject).description
        return <span className='truncate'>{description}</span>
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
        return <span>{formatDate(String(startDate))}</span>
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
        return <span>{formatDate(String(endDate))}</span>
      }
    }
  ]

  // Actions column
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
              <Link href={`${actions.basePath}/${entity.id}`}>
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
            <DropdownMenuItem className='text-red-600' onClick={() => actions.onDelete(entity.id)}>
              <Trash className='mr-0.5 h-4 w-4' />
              {getDeleteLabel(entityType)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  // Combine columns based on entity type
  return [
    ...baseColumns,
    ...(entityType === 'users'
      ? usersColumns
      : entityType === 'clients'
        ? clientsColumns
        : projectsColumns),
    actionsColumn
  ]
}
