import { Table } from '@tanstack/react-table'
import { ChevronDown, SettingsIcon } from 'lucide-react'
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

interface TableToolbarProps<TData> {
  table: Table<TData>
  filtering: string
  setFiltering: (value: string) => void
  selectedRows: any[]
  onDeleteSelected: () => void
  onSuspendSelected: () => void
  onUnsuspendSelected: () => void
}

export function TableToolbar<TData>({
  table,
  filtering,
  setFiltering,
  selectedRows,
  onDeleteSelected,
  onSuspendSelected,
  onUnsuspendSelected
}: TableToolbarProps<TData>) {
  return (
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
            <DropdownMenuContent className='space-y-1'>
              <DropdownMenuLabel className='text-center'>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button
                  className='cursor-pointer w-full'
                  variant='destructive'
                  size='sm'
                  onClick={onDeleteSelected}
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
                    onClick={onSuspendSelected}
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
                    onClick={onUnsuspendSelected}
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
