import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

interface TablePaginationProps<TData> {
  table: Table<TData>
  selectedRows: any[]
}

export function TablePagination<TData>({ table, selectedRows }: TablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-end py-4 space-x-2'>
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
  )
}
