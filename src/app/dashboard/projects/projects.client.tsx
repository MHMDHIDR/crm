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
import { useCallback, useEffect, useState } from 'react'
import { deleteProjects } from '@/actions/projects/delete-project'
import { getProjects } from '@/actions/projects/get-project'
import { toggleProjectStatus } from '@/actions/projects/toggle-project-status'
import { ConfirmationDialog } from '@/components/custom/confirmation-dialog'
import { TablePagination } from '@/components/custom/data-table/table-pagination'
import { BulkAction, TableToolbar } from '@/components/custom/data-table/table-toolbar'
import EmptyState from '@/components/custom/empty-state'
import { LoadingCard } from '@/components/custom/loading'
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
import { Link } from '@/i18n/routing'
import { clsx } from '@/lib/cn'
import type { ExtendedProject } from '@/db/schema'

export default function ProjectsClientPage() {
  const [projects, setProjects] = useState<ExtendedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | undefined>('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filtering, setFiltering] = useState('') // This will add global filtering state, which will help us filter the table data

  const dashboardProjectTranslation = useTranslations('dashboard.projects')

  /** Handling Dialogs states (Pefect for Reusable Modals): */
  const [dialogProps, setDialogProps] = useState({
    open: false,
    action: null as 'delete' | 'activate' | 'deactivate' | null,
    title: '',
    description: '',
    buttonText: '',
    buttonClass: '',
    selectedIds: [] as string[]
  })

  const toast = useToast()

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const result = await getProjects()

    console.log(result)

    if (!result.success) {
      setErrorMsg(result.error)
    }

    if (result.success && result.data) {
      setProjects(result.data)
    }
    setLoading(false)
  }, [])

  const handleDeleteSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'delete',
      title: dashboardProjectTranslation('dialog.delete.title'),
      description: dashboardProjectTranslation('dialog.delete.description'),
      buttonText: dashboardProjectTranslation('dialog.delete.button'),
      buttonClass: 'bg-red-600',
      selectedIds: ids
    })
  }

  const handleDeleteSingleProject = (projectId: string) => {
    setDialogProps({
      open: true,
      action: 'delete',
      title: dashboardProjectTranslation('dialog.delete.singleTitle'),
      description: dashboardProjectTranslation('dialog.delete.singleDescription'),
      buttonText: dashboardProjectTranslation('dialog.delete.singleTitle'),
      buttonClass: 'bg-red-600',
      selectedIds: [projectId]
    })
  }

  const handleActivateSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'activate',
      title: dashboardProjectTranslation('dialog.activate.title'),
      description: dashboardProjectTranslation('dialog.activate.description'),
      buttonText: dashboardProjectTranslation('dialog.activate.button'),
      buttonClass: 'bg-green-600',
      selectedIds: ids
    })
  }

  const handleDeactivateSelected = () => {
    const ids = selectedRows.map(row => row.original.id)
    setDialogProps({
      open: true,
      action: 'deactivate',
      title: dashboardProjectTranslation('dialog.deactivate.title'),
      description: dashboardProjectTranslation('dialog.deactivate.description'),
      buttonText: dashboardProjectTranslation('dialog.deactivate.button'),
      buttonClass: 'bg-yellow-600',
      selectedIds: ids
    })
  }

  const handleActivateSingleProject = (projectId: string) => {
    setDialogProps({
      open: true,
      action: 'activate',
      title: dashboardProjectTranslation('dialog.activate.singleTitle'),
      description: dashboardProjectTranslation('dialog.activate.singleDescription'),
      buttonText: dashboardProjectTranslation('dialog.activate.button'),
      buttonClass: 'bg-green-600',
      selectedIds: [projectId]
    })
  }

  const handleDeactivateSingleProject = (projectId: string) => {
    setDialogProps({
      open: true,
      action: 'deactivate',
      title: dashboardProjectTranslation('dialog.deactivate.singleTitle'),
      description: dashboardProjectTranslation('dialog.deactivate.singleDescription'),
      buttonText: dashboardProjectTranslation('dialog.deactivate.button'),
      buttonClass: 'bg-yellow-600',
      selectedIds: [projectId]
    })
  }

  const handleAction = async () => {
    if (!dialogProps.action || !dialogProps.selectedIds.length) return

    const actions = {
      delete: deleteProjects,
      activate: (projectIds: string[]) => toggleProjectStatus(projectIds, 'active'),
      deactivate: (projectIds: string[]) => toggleProjectStatus(projectIds, 'deactivated')
    }

    const result = await actions[dialogProps.action](dialogProps.selectedIds)

    if (result?.success) {
      setDialogProps(prev => ({ ...prev, open: false }))
      toast.success(result.message as string)
      fetchProjects()
    } else {
      toast.error(result?.message || 'Operation failed')
    }
  }

  const getBulkActions = () => {
    const actions: BulkAction[] = [
      {
        label: dashboardProjectTranslation('bulkActions.deleteSelected'),
        onClick: handleDeleteSelected,
        variant: 'destructive'
      }
    ]

    // Only proceed if there are selected rows
    if (selectedRows.length > 0) {
      // Check if any selected row has 'deactivated' status
      const hasDeactiveProjects = selectedRows.some(row => row.original.status === 'deactivated')

      // Check if any selected row has 'active' status
      const hasActiveProjects = selectedRows.some(row => row.original.status === 'active')

      // Add Activate button if there are any deactivated projects
      if (hasDeactiveProjects) {
        actions.push({
          label: dashboardProjectTranslation('bulkActions.activateSelected'),
          onClick: handleActivateSelected,
          variant: 'success'
        })
      }

      // Add Deactivate button if there are any active projects
      if (hasActiveProjects) {
        actions.push({
          label: dashboardProjectTranslation('bulkActions.deactivateSelected'),
          onClick: handleDeactivateSelected,
          variant: 'warning'
        })
      }
    }

    return actions
  }

  const { columns, filterFields } = useSharedColumns<ExtendedProject>({
    entityType: 'project',
    actions: {
      onDelete: handleDeleteSingleProject,
      onActivate: handleActivateSingleProject,
      onDeactivate: handleDeactivateSingleProject,
      basePath: '/projects'
    }
  })

  const table = useReactTable({
    data: projects,
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
    fetchProjects()
  }, [fetchProjects])

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
                  {dashboardProjectTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href='/dashboard/create-project'>
            <Button>{dashboardProjectTranslation('actions.addNewProject')}</Button>
          </Link>
        </div>
      </header>
      <main className='w-full'>
        <TableToolbar
          table={table}
          filtering={filtering}
          setFiltering={setFiltering}
          selectedRows={selectedRows}
          searchPlaceholder={dashboardProjectTranslation('actions.search')}
          bulkActions={getBulkActions()}
          filterFields={filterFields}
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
                      'text-orange-700 hover:text-orange-50 bg-orange-200 hover:bg-orange-500 dark:text-orange-200 dark:bg-orange-900 dark:hover:bg-orange-950':
                        row.getValue('status') === 'deactivated'
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
                    <Link
                      href={
                        errorMsg === 'no projects'
                          ? '/dashboard/create-project'
                          : '/dashboard/create-client'
                      }
                    >
                      <EmptyState>
                        <p className='mt-4 text-lg text-gray-500 select-none dark:text-gray-400'>
                          {dashboardProjectTranslation(
                            errorMsg === 'no projects'
                              ? 'empty.message.noProjects'
                              : 'empty.message.noClients'
                          )}
                        </p>
                        <Button>
                          {dashboardProjectTranslation(
                            errorMsg === 'no projects'
                              ? 'actions.addNewProject'
                              : 'actions.addNewClient'
                          )}
                        </Button>
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
