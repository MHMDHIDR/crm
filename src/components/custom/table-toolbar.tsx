import { Table } from '@tanstack/react-table'
import { ChevronDown, SettingsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
}

export function TableToolbar<TData>({
  table,
  filtering,
  setFiltering,
  selectedRows,
  bulkActions = [],
  searchPlaceholder = 'Search...'
}: TableToolbarProps<TData>) {
  const hasBulkActions = bulkActions.length > 0

  const dashboardDatatableTranslation = useTranslations('dashboard.dataTable.tableToolbar')

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
