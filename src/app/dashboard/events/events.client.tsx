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
import { getEvents } from '@/actions/events/get-events'
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
import type { Event } from '@/db/schema'

export default function EventsPageEvent() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filtering, setFiltering] = useState('')

  const dashboardEventsTranslation = useTranslations('dashboard.events')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const result = await getEvents()
    if (result.success && result.data) {
      setEvents(result.data)
    }
    setLoading(false)
  }, [])

  const { columns, filterFields } = useSharedColumns<Event>({
    entityType: 'events',
    actions: { basePath: '/events' }
  })

  const table = useReactTable({
    data: events,
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
    fetchEvents()
  }, [fetchEvents])

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
                  {dashboardEventsTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className='w-full'>
        <TableToolbar
          table={table}
          filtering={filtering}
          setFiltering={setFiltering}
          selectedRows={selectedRows}
          searchPlaceholder={dashboardEventsTranslation('actions.search')}
          filterFields={filterFields}
        />

        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className='text-center'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
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
                    {row.getVisibleCells().map(cell => {
                      const _ROLE_CLASSNAMES =
                        'text-green-600 bg-green-50 text-orange-600 bg-orange-50 text-blue-600 bg-blue-50'

                      return (
                        <TableCell key={cell.id} className='text-center'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
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
                    <EmptyState>
                      <p className='mt-4 text-lg text-gray-500 select-none dark:text-gray-400'>
                        {dashboardEventsTranslation('empty.message')}
                      </p>
                    </EmptyState>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination table={table} selectedRows={selectedRows} isSelectable={false} />
      </main>
    </SidebarInset>
  )
}
