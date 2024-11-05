import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/cn'

type SearchableSelectItemProps = {
  searchableItems: {
    value: string
    label: string
  }[]
  item?: string
  setItem: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchableSelectItem({
  searchableItems,
  item,
  setItem,
  placeholder = 'Select an Item',
  className = ''
}: SearchableSelectItemProps) {
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(
    searchableItems.find(i => i.value === item)?.label || ''
  )

  useEffect(() => {
    setSelectedItem(searchableItems.find(i => i.value === item)?.label || '')
  }, [item, searchableItems])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(`min-w-full justify-between`, className)}
        >
          {selectedItem || placeholder}
          <CaretSortIcon className='w-4 h-4 ml-2 opacity-50 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[clamp(22rem,23rem,35rem)] p-0 overflow-y-auto max-h-64 md:max-h-96'
        avoidCollisions={false}
      >
        <Command>
          <CommandInput placeholder='Look for an Item' className='px-4 h-9' />
          <CommandEmpty className='py-1.5 px-4'>
            Sorry, we could not find what you are looking for
          </CommandEmpty>
          <CommandGroup>
            {searchableItems.map(searchableItem => (
              <CommandItem
                key={searchableItem.value}
                value={searchableItem.value}
                onSelect={currentValue => {
                  setSelectedItem(currentValue)
                  setItem(currentValue)
                  setOpen(false)
                }}
              >
                {searchableItem.label}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    selectedItem === searchableItem.label ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
