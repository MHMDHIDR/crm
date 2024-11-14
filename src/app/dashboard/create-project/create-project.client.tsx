'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getClients } from '@/actions/clients/get-clients'
import { createProject } from '@/actions/projects/create-project'
import { SearchableSelectItem } from '@/components/custom/searchable-select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { Client, clientStatus } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format-date'
import { getInitialProjectValues, projectSchema } from '@/validators/project'
import type { ProjectSchemaType } from '@/validators/project'

export default function CreateProjectClientPage() {
  const toast = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [_item, setItem] = useState<Client['name']>('')
  const dashboardClientTranslation = useTranslations('dashboard.createProject')

  const form = useForm<ProjectSchemaType>({
    resolver: zodResolver(projectSchema),
    defaultValues: getInitialProjectValues()
  })

  useEffect(() => {
    async function fetchClients() {
      const result = await getClients()
      if (result.success && result.data) {
        setClients(result.data)
      }
    }
    fetchClients()
  }, [])

  async function onSubmit(data: ProjectSchemaType) {
    try {
      const result = await createProject(data)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      form.reset()
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='h-4 mr-2' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href='/dashboard'>
                  {dashboardClientTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>{dashboardClientTranslation('breadcrumb.create')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>
            {dashboardClientTranslation('form.title')}
          </h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardClientTranslation('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dashboardClientTranslation('form.name.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardClientTranslation('form.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={dashboardClientTranslation('form.description.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-wrap gap-3'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col flex-1'>
                      <FormLabel>{dashboardClientTranslation('form.dates.start.label')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild className='min-w-full'>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                formatDate(String(field.value))
                              ) : (
                                <span>
                                  {dashboardClientTranslation('form.dates.start.placeholder')}
                                </span>
                              )}
                              <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={new Date(field.value!)}
                            onSelect={field.onChange}
                            disabled={date => {
                              const endDate = form.getValues('endDate')
                              const isAfterToday = date >= new Date()
                              const isBeforeEndDate = endDate ? date <= new Date(endDate) : true
                              return !isAfterToday || !isBeforeEndDate
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col flex-1'>
                      <FormLabel>{dashboardClientTranslation('form.dates.end.label')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild className='min-w-full'>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                formatDate(String(field.value))
                              ) : (
                                <span>
                                  {dashboardClientTranslation('form.dates.end.placeholder')}
                                </span>
                              )}
                              <CalendarIcon className='w-4 h-4 ml-auto opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={new Date(field.value!)}
                            onSelect={field.onChange}
                            disabled={date => {
                              const startDate = form.getValues('startDate')
                              const isAfterToday = date >= new Date()
                              const isAfterStartDate = startDate
                                ? date >= new Date(startDate)
                                : true
                              return !isAfterToday || !isAfterStartDate
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='clientId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardClientTranslation('form.client.label')}</FormLabel>
                    <SearchableSelectItem
                      searchableItems={clients.map(client => {
                        return { value: client.id, label: client.name }
                      })}
                      item={field.value}
                      setItem={value => {
                        const selectedClient = clients.find(client => client.id === value)
                        field.onChange(value)
                        setItem(selectedClient?.name || '')
                      }}
                      placeholder={dashboardClientTranslation('form.client.placeholder')}
                      className='w-full px-4 py-2'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardClientTranslation('form.status.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='rtl:rtl'>
                          <SelectValue
                            placeholder={dashboardClientTranslation('form.status.placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='rtl:rtl'>
                        <SelectItem value={clientStatus.ACTIVE}>
                          {dashboardClientTranslation('form.status.options.active')}
                        </SelectItem>
                        <SelectItem value={clientStatus.DEACTIVE}>
                          {dashboardClientTranslation('form.status.options.deactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant='pressable' className='w-full'>
                {dashboardClientTranslation('form.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
