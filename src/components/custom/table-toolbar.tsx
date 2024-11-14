import { Table } from '@tanstack/react-table'
import { ChevronDown, SettingsIcon, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  DataTableFacetedFilter,
  DataTableFilterField
} from './data-table/data-table-faceted-filter'

export type BulkAction = {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'warning' | 'success'
}

type TableToolbarProps<TData> = {
  table: Table<TData>
  filtering: string
  setFiltering: (value: string) => void
  selectedRows: any[]
  bulkActions?: BulkAction[]
  searchPlaceholder?: string
  filterFields?: DataTableFilterField<TData>[]
}

export function TableToolbar<TData>({
  table,
  filtering,
  setFiltering,
  selectedRows,
  bulkActions = [],
  searchPlaceholder = 'Search...',
  filterFields = []
}: TableToolbarProps<TData>) {
  const dashboardDatatableTranslation = useTranslations('dashboard.dataTable.tableToolbar')
  const hasBulkActions = bulkActions.length > 0

  const isFiltered = table.getState().columnFilters.length > 0

  const { filterableColumns } = useMemo(() => {
    return { filterableColumns: filterFields.filter(field => field.options) }
  }, [filterFields])

  return (
    <div className='flex items-center justify-between gap-x-2 py-2.5'>
      <div className='flex items-center w-full gap-x-2'>
        <Input
          placeholder={searchPlaceholder || dashboardDatatableTranslation('search')}
          value={filtering}
          onChange={event => setFiltering(event.target.value)}
          className='max-w-md'
        />
        {selectedRows.length > 0 && hasBulkActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                {dashboardDatatableTranslation('bulkActions')}
                <SettingsIcon className='w-4 h-4 ml-2' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='space-y-1'>
              <DropdownMenuLabel className='text-center'>
                {dashboardDatatableTranslation('bulkActions')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {bulkActions.map((action, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Button
                    className='w-full cursor-pointer'
                    variant={action.variant || 'default'}
                    size='sm'
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {filterableColumns.map(
          column =>
            table.getColumn(column.id as string) && (
              <DataTableFacetedFilter
                key={column.id as string}
                column={table.getColumn(column.id as string)}
                title={column.label}
                options={column.options ?? []}
              />
            )
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='ml-auto'>
            {dashboardDatatableTranslation('columns')} <ChevronDown className='w-4 h-4 ml-2' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={value => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
