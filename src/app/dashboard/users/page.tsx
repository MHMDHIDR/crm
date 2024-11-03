'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import {
  Ban,
  ChevronDown,
  Lock,
  MoreHorizontal,
  Pencil,
  SettingsIcon,
  Trash,
  UserCog
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { deleteUsers } from '@/actions/delete-user'
import { getUsers } from '@/actions/get-users'
import { suspendUsers, unsuspendUsers } from '@/actions/suspense-user'
import EmptyState from '@/components/custom/empty-state'
import { LoadingCard } from '@/components/custom/loading'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { clsx } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import type { User } from '@/db/schema'

/* eslint-disable max-lines */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filtering, setFiltering] = useState('') // Add global filtering state

  type DialogPropsType = {
    open: boolean
    action: 'delete' | 'suspend' | 'unsuspend' | null
    title: string
    description: string
    buttonText: string
    buttonClass: string
    selectedIds: string[]
  }

  /** Handling Dialogs states (Pefect for Reusable Modals): */
  const [dialogProps, setDialogProps] = useState<DialogPropsType>({
    open: false,
    action: null,
    title: '',
    description: '',
    buttonText: '',
    buttonClass: '',
    selectedIds: []
  })

  const toast = useToast()

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const result = await getUsers()
    if (result.success && result.data) {
      setUsers(result.data)
    }
    setLoading(false)
  }, [])

  // Define columns
  const columns: ColumnDef<User>[] = [
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
      header: 'Email',
      cell: ({ row }) => {
        return (
          <Link href={`/dashboard/users/${row.original.id}`} className='hover:underline'>
            {row.getValue('email')}
          </Link>
        )
      }
    },
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        return (
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
      }
    },
    {
      accessorKey: 'emailVerified',
      header: 'Verified Status',
      cell: ({ row }) => {
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-100': row.getValue('emailVerified') !== null,
              'text-red-600 bg-red-100': row.getValue('emailVerified') === null
            })}
          >
            {row.getValue('emailVerified') ? 'Verified' : 'Pending'}
          </span>
        )
      }
    },
    {
      accessorKey: 'suspendedAt',
      header: 'Suspended Status',
      cell: ({ row }) => {
        return (
          <span
            className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
              'text-green-600 bg-green-100': row.getValue('suspendedAt') === null,
              'text-red-600 bg-red-100': row.getValue('suspendedAt') !== null
            })}
          >
            {row.getValue('suspendedAt') ? formatDate(row.getValue('suspendedAt')) : 'Active'}
          </span>
        )
      }
    },
    {
      id: 'actions',
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}`}>
                  <UserCog className='mr-2 h-4 w-4' />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}/edit`}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit User
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Lock className='mr-2 h-4 w-4' />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem
                className={clsx({
                  'text-red-600': !user.suspendedAt,
                  'text-green-600': user.suspendedAt
                })}
                onClick={() =>
                  user.suspendedAt
                    ? handleUnsuspendSingleUser(user.id)
                    : handleSuspendSingleUser(user.id)
                }
              >
                <Ban className='mr-2 h-4 w-4' />
                {user.suspendedAt ? 'Unsuspend User' : 'Suspend User'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => handleDeleteSingleUser(user.id)}
              >
                <Trash className='mr-2 h-4 w-4' />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  // Initialize table
  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setFiltering, // Add global filter change handler
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: filtering // Add global filter state
    }
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDeleteSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'delete',
      title: 'Delete Selected Users',
      description:
        'This action cannot be undone. This will permanently delete the selected users and remove their data from our servers.',
      buttonText: 'Delete Users',
      buttonClass: 'bg-red-600',
      selectedIds: ids
    })
    // setUserToDelete(null) // Ensure we're not targeting a specific user this means we're deleting multiple users
  }

  const handleDeleteSingleUser = (userId: string) => {
    // setUserToDelete(userId)
    setDialogProps({
      open: true,
      action: 'delete',
      title: 'Delete User',
      description:
        'This action cannot be undone. This will permanently delete this user and remove their data from our servers.',
      buttonText: 'Delete User',
      buttonClass: 'bg-red-600',
      selectedIds: [userId]
    })
  }

  const handleSuspendSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'suspend',
      title: 'Suspend Selected Users',
      description:
        'Are you sure you want to suspend the selected users? They will not be able to access the system until unsuspended.',
      buttonText: 'Suspend Users',
      buttonClass: 'bg-yellow-600',
      selectedIds: ids
    })
  }

  const handleUnsuspendSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'unsuspend',
      title: 'Unsuspend Selected Users',
      description:
        'Are you sure you want to unsuspend the selected users? They will regain access to the system.',
      buttonText: 'Unsuspend Users',
      buttonClass: 'bg-green-600',
      selectedIds: ids
    })
  }

  const handleSuspendSingleUser = (userId: string) => {
    setDialogProps({
      open: true,
      action: 'suspend',
      title: 'Suspend User',
      description:
        'Are you sure you want to suspend this user? They will not be able to access the system until unsuspended.',
      buttonText: 'Suspend User',
      buttonClass: 'bg-yellow-600',
      selectedIds: [userId]
    })
  }

  const handleUnsuspendSingleUser = (userId: string) => {
    setDialogProps({
      open: true,
      action: 'unsuspend',
      title: 'Unsuspend User',
      description:
        'Are you sure you want to unsuspend this user? They will regain access to the system.',
      buttonText: 'Unsuspend User',
      buttonClass: 'bg-green-600',
      selectedIds: [userId]
    })
  }

  const handleAction = async () => {
    if (!dialogProps.action || !dialogProps.selectedIds.length) return

    let result
    if (dialogProps.action === 'delete') {
      result = await deleteUsers(dialogProps.selectedIds)
    } else if (dialogProps.action === 'suspend') {
      result = await suspendUsers(dialogProps.selectedIds)
    } else if (dialogProps.action === 'unsuspend') {
      result = await unsuspendUsers(dialogProps.selectedIds)
    }

    if (result?.success) {
      setDialogProps(prev => ({ ...prev, open: false }))
      toast.success(result.message as string)
      fetchUsers()
    } else {
      toast.error(result?.message || 'Operation failed')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex gap-2 items-center w-full'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb className='flex-1'>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href='/dashboard/create-user'>
            <Button>Add New User</Button>
          </Link>
        </div>
      </header>
      <main className='w-full'>
        <div className='flex items-center justify-between gap-x-2 py-2.5'>
          <div className='flex items-center gap-x-2 w-full'>
            <Input
              placeholder='Look for a user...'
              value={filtering}
              onChange={event => setFiltering(event.target.value)}
              className='max-w-md'
            />
            {selectedRows.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline'>
                    Bulk Actions <SettingsIcon className='ml-2 h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className='text-center'>Bult Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Button
                      className='cursor-pointer w-full'
                      variant='destructive'
                      size='sm'
                      onClick={handleDeleteSelected}
                    >
                      Delete Selected
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {selectedRows.some(row => row.original.suspendedAt === null) && (
                    <DropdownMenuItem asChild>
                      <Button
                        className='cursor-pointer w-full'
                        variant='warning'
                        size='sm'
                        onClick={handleSuspendSelected}
                      >
                        Suspend Selected
                      </Button>
                    </DropdownMenuItem>
                  )}
                  {selectedRows.some(row => row.original.suspendedAt !== null) && (
                    <DropdownMenuItem asChild>
                      <Button
                        className='cursor-pointer w-full'
                        variant='success'
                        size='sm'
                        onClick={handleUnsuspendSelected}
                      >
                        Unsuspend Selected
                      </Button>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={clsx('rounded-full px-2.5 py-0.5 border select-none', {
                      'text-orange-700 bg-orange-200 hover:bg-orange-500 dark:text-orange-200 dark:bg-orange-900 dark:hover:bg-orange-950':
                        row.getValue('suspendedAt') !== null
                    })}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className='text-center'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    <LoadingCard renderedSkeletons={7} />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    <Link href='/dashboard/create-user'>
                      <EmptyState>
                        <p className='mt-4 text-lg text-gray-500 dark:text-gray-400 select-none'>
                          Sorry we couldn&apos;t find any users.
                        </p>
                        <Button>Add New User</Button>
                      </EmptyState>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-sm text-muted-foreground'>
            {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

        <AlertDialog
          open={dialogProps.open}
          onOpenChange={open => setDialogProps(prev => ({ ...prev, open }))}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogProps.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialogProps.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAction} className={dialogProps.buttonClass}>
                {dialogProps.buttonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </SidebarInset>
  )
}
