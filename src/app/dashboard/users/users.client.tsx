'use client'

import {
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
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { deleteUsers } from '@/actions/users/delete-user'
import { getUsers } from '@/actions/users/get-users'
import { toggleUserStatus } from '@/actions/users/toggle-user-status'
import { ConfirmationDialog } from '@/components/custom/confirmation-dialog'
import { getSharedColumns } from '@/components/custom/data-table-columns'
import EmptyState from '@/components/custom/empty-state'
import { LoadingCard } from '@/components/custom/loading'
import { TablePagination } from '@/components/custom/table-pagination'
import { BulkAction, TableToolbar } from '@/components/custom/table-toolbar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
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
import type { User } from '@/db/schema'

export default function UsersClientPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filtering, setFiltering] = useState('') // This will add global filtering state, which will help us filter the table data

  /** Handling Dialogs states (Pefect for Reusable Modals): */
  const [dialogProps, setDialogProps] = useState({
    open: false,
    action: null as 'delete' | 'suspend' | 'unsuspend' | null,
    title: '',
    description: '',
    buttonText: '',
    buttonClass: '',
    selectedIds: [] as string[]
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

    const actions = {
      delete: deleteUsers,
      suspend: (userIds: string[]) => toggleUserStatus(userIds, 'suspend'),
      unsuspend: (userIds: string[]) => toggleUserStatus(userIds, 'unsuspend')
    }

    const result = await actions[dialogProps.action](dialogProps.selectedIds)

    if (result?.success) {
      setDialogProps(prev => ({ ...prev, open: false }))
      toast.success(result.message as string)
      fetchUsers()
    } else {
      toast.error(result?.message || 'Operation failed')
    }
  }

  const getBulkActions = () => {
    // Always include Delete Selected action
    const actions: BulkAction[] = [
      { label: 'Delete Selected', onClick: handleDeleteSelected, variant: 'destructive' }
    ]

    // Only proceed if there are selected rows
    if (selectedRows.length > 0) {
      // Check if any selected row has suspendedAt as null (active users)
      const hasActiveUsers = selectedRows.some(row => row.original.suspendedAt === null)

      // Check if any selected row has suspendedAt as not null (suspended users)
      const hasSuspendedUsers = selectedRows.some(row => row.original.suspendedAt !== null)

      // Add Suspend button if there are any active users
      if (hasActiveUsers) {
        actions.push({
          label: 'Suspend Selected',
          onClick: handleSuspendSelected,
          variant: 'warning'
        })
      }

      // Add Unsuspend button if there are any suspended users
      if (hasSuspendedUsers) {
        actions.push({
          label: 'Unsuspend Selected',
          onClick: handleUnsuspendSelected,
          variant: 'success'
        })
      }
    }

    return actions
  }

  const columns = getSharedColumns<User>('users', {
    onDelete: handleDeleteSingleUser,
    onSuspend: handleSuspendSingleUser,
    onUnsuspend: handleUnsuspendSingleUser,
    basePath: '/dashboard/users'
  })

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
    onGlobalFilterChange: setFiltering,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: filtering
    }
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center w-full gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb className='flex-1'>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
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
        <TableToolbar
          table={table}
          filtering={filtering}
          setFiltering={setFiltering}
          selectedRows={selectedRows}
          searchPlaceholder='Look for a User...'
          bulkActions={getBulkActions()}
        />

        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id} className='text-center'>
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
                        <p className='mt-4 text-lg text-gray-500 select-none dark:text-gray-400'>
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

        <TablePagination table={table} selectedRows={selectedRows} />

        <ConfirmationDialog
          open={dialogProps.open}
          onOpenChange={open => setDialogProps(prev => ({ ...prev, open }))}
          title={dialogProps.title}
          description={dialogProps.description}
          buttonText={dialogProps.buttonText}
          buttonClass={dialogProps.buttonClass}
          onConfirm={handleAction}
        />
      </main>
    </SidebarInset>
  )
}
