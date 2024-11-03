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
import type { User } from '@/db/schema'

interface GetUserColumnsProps {
  onDelete: (userId: string) => void
  onSuspend: (userId: string) => void
  onUnsuspend: (userId: string) => void
}

export function getUserColumns({
  onDelete,
  onSuspend,
  onUnsuspend
}: GetUserColumnsProps): ColumnDef<User>[] {
  return [
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
        <Link href={`/dashboard/users/${row.original.id}`} className='hover:underline'>
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
    },
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
      cell: ({ row }) => (
        <span
          className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
            'text-green-600 bg-green-100': row.getValue('role') === 'Admin',
            'text-orange-600 bg-orange-100': row.getValue('role') === 'Supervisor',
            'text-blue-600 bg-blue-100': row.getValue('role') === 'Employee'
          })}
        >
          {row.getValue('role')}
        </span>
      )
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
      cell: ({ row }) => (
        <span
          className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
            'text-green-600 bg-green-100': row.getValue('emailVerified') !== null,
            'text-red-600 bg-red-100': row.getValue('emailVerified') === null
          })}
        >
          {row.getValue('emailVerified') ? 'Verified' : 'Pending'}
        </span>
      )
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
      cell: ({ row }) => (
        <span
          className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
            'text-green-600 bg-green-100': row.getValue('suspendedAt') === null,
            'text-red-600 bg-red-100': row.getValue('suspendedAt') !== null
          })}
        >
          {row.getValue('suspendedAt') ? formatDate(row.getValue('suspendedAt')) : 'Active'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const user = row.original

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
                <Link href={`/dashboard/users/${user.id}`}>
                  <Pencil className='mr-0.5 h-4 w-4' />
                  View / Edit User
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={clsx({
                  'text-red-600': !user.suspendedAt,
                  'text-green-600': user.suspendedAt
                })}
                onClick={() => (user.suspendedAt ? onUnsuspend(user.id) : onSuspend(user.id))}
              >
                <Ban className='mr-0.5 h-4 w-4' />
                {user.suspendedAt ? 'Unsuspend User' : 'Suspend User'}
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-600' onClick={() => onDelete(user.id)}>
                <Trash className='mr-0.5 h-4 w-4' />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]
}
