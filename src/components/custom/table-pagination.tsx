import { Table } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface TablePaginationProps<TData> {
  table: Table<TData>
  selectedRows: any[]
  isSelectable?: boolean
}

export function TablePagination<TData>({
  table,
  selectedRows,
  isSelectable = true
}: TablePaginationProps<TData>) {
  const dashboardDatatableTranslation = useTranslations('dashboard.dataTable.tablePagination')

  return (
    <div className='flex items-center justify-end py-4 gap-x-2'>
      {isSelectable && (
        <div className='text-sm text-muted-foreground'>
          {dashboardDatatableTranslation('selected', {
            count: selectedRows.length,
            total: table.getFilteredRowModel().rows.length
          })}
        </div>
      )}
      <Button
        variant='outline'
        size='sm'
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {dashboardDatatableTranslation('previous')}
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {dashboardDatatableTranslation('next')}
      </Button>
    </div>
  )
}
