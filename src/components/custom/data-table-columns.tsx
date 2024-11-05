import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Ban, MoreHorizontal, Pencil, Trash } from 'lucide-react'
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
  status: 'active' | 'inactive'
}

// Define the actions that can be performed
type TableActions = {
  onDelete: (id: string) => void
  onSuspend?: (id: string) => void
  onUnsuspend?: (id: string) => void
  basePath: string // e.g., '/dashboard/users' or '/dashboard/clients'
}

export function getSharedColumns<T extends BaseEntity>(
  entityType: 'user' | 'client',
  actions: TableActions
): ColumnDef<T>[] {
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
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`${actions.basePath}/${row.original.id}`} className='hover:underline'>
          {row.getValue('email')}
        </Link>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  ]

  // User-specific columns
  const userColumns: ColumnDef<T>[] = [
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          <ArrowUpDown className='ml-2 h-4 w-4' />
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
          Verified Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
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
            {emailVerified ? 'Verified' : 'Pending'}
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
          Suspended Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
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
            {suspendedAt ? formatDate(String(suspendedAt)) : 'Active'}
          </span>
        )
      }
    }
  ]

  // Client-specific columns
  const clientColumns: ColumnDef<T>[] = [
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => {
        const status = (row.original as unknown as Client).status
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-100': status === 'active',
              'text-red-600 bg-red-100': status === 'inactive'
            })}
          >
            {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
          </span>
        )
      }
    }
  ]

  // Actions column
  const actionsColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => {
      const entity = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel className='select-none'>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`${actions.basePath}/${entity.id}`}>
                <Pencil className='mr-0.5 h-4 w-4' />
                View / Edit {entityType === 'user' ? 'User' : 'Client'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {entityType === 'user' && actions.onSuspend && actions.onUnsuspend && (
              <DropdownMenuItem
                className={clsx({
                  'text-red-600': !(row.original as unknown as User).suspendedAt,
                  'text-green-600': (row.original as unknown as User).suspendedAt
                })}
                onClick={() =>
                  (row.original as unknown as User).suspendedAt
                    ? actions.onUnsuspend?.(entity.id)
                    : actions.onSuspend?.(entity.id)
                }
              >
                <Ban className='mr-0.5 h-4 w-4' />
                {(row.original as unknown as User).suspendedAt ? 'Unsuspend User' : 'Suspend User'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className='text-red-600' onClick={() => actions.onDelete(entity.id)}>
              <Trash className='mr-0.5 h-4 w-4' />
              Delete {entityType === 'user' ? 'User' : 'Client'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }

  // Combine columns based on entity type
  return [...baseColumns, ...(entityType === 'user' ? userColumns : clientColumns), actionsColumn]
}
