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
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { deleteClients } from '@/actions/clients/delete-client'
import { getClients } from '@/actions/clients/get-clients'
import { ConfirmationDialog } from '@/components/custom/confirmation-dialog'
import EmptyState from '@/components/custom/empty-state'
import { LoadingCard } from '@/components/custom/loading'
import { TablePagination } from '@/components/custom/table-pagination'
import { TableToolbar } from '@/components/custom/table-toolbar'
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
import { useSharedColumns } from '@/hooks/use-shared-columns'
import { useToast } from '@/hooks/use-toast'
import type { Client } from '@/db/schema'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filtering, setFiltering] = useState('') // This will add global filtering state, which will help us filter the table data

  const dashboardClientsTranslation = useTranslations('dashboard.clients')

  /** Handling Dialogs states (Pefect for Reusable Modals): */
  const [dialogProps, setDialogProps] = useState({
    open: false,
    action: null as 'delete' | null,
    title: '',
    description: '',
    buttonText: '',
    buttonClass: '',
    selectedIds: [] as string[]
  })

  const toast = useToast()

  // Fetch clients
  const fetchClients = useCallback(async () => {
    setLoading(true)
    const result = await getClients()
    if (result.success && result.data) {
      setClients(result.data)
    }
    setLoading(false)
  }, [])

  const handleDeleteSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'delete',
      title: dashboardClientsTranslation('dialog.delete.title'),
      description: dashboardClientsTranslation('dialog.delete.description'),
      buttonText: dashboardClientsTranslation('dialog.delete.button'),
      buttonClass: 'bg-red-600',
      selectedIds: ids
    })
  }

  const handleDeleteSingleClient = (clientId: string) => {
    setDialogProps({
      open: true,
      action: 'delete',
      title: dashboardClientsTranslation('dialog.delete.singleTitle'),
      description: dashboardClientsTranslation('dialog.delete.singleDescription'),
      buttonText: dashboardClientsTranslation('dialog.delete.singleButton'),
      buttonClass: 'bg-red-600',
      selectedIds: [clientId]
    })
  }

  const handleAction = async () => {
    if (!dialogProps.action || !dialogProps.selectedIds.length) return

    const actions = { delete: deleteClients }

    const result = await actions[dialogProps.action](dialogProps.selectedIds)

    if (result?.success) {
      setDialogProps(prev => ({ ...prev, open: false }))
      toast.success(result.message as string)
      fetchClients()
    } else {
      toast.error(result?.message || 'Operation failed')
    }
  }

  const columns = useSharedColumns<Client>({
    entityType: 'clients',
    actions: {
      onDelete: handleDeleteSingleClient,
      basePath: '/dashboard/clients'
    }
  })

  const table = useReactTable({
    data: clients,
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
    fetchClients()
  }, [fetchClients])

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center w-full gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb className='flex-1'>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>
                  {dashboardClientsTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href='/dashboard/create-client'>
            <Button>{dashboardClientsTranslation('actions.addNew')}</Button>
          </Link>
        </div>
      </header>
      <main className='w-full'>
        <TableToolbar
          table={table}
          filtering={filtering}
          setFiltering={setFiltering}
          selectedRows={selectedRows}
          searchPlaceholder={dashboardClientsTranslation('actions.search')}
          bulkActions={[
            {
              label: dashboardClientsTranslation('bulkActions.deleteSelected'),
              onClick: handleDeleteSelected,
              variant: 'destructive'
            }
          ]}
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
                    className='rounded-full px-2.5 py-0.5 border select-none'
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
                    <Link href='/dashboard/create-client'>
                      <EmptyState>
                        <p className='mt-4 text-lg text-gray-500 select-none dark:text-gray-400'>
                          {dashboardClientsTranslation('empty.message')}
                        </p>
                        <Button>{dashboardClientsTranslation('actions.addNew')}</Button>
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
