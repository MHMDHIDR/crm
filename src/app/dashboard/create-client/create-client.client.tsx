'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { createClient } from '@/actions/clients/create-client'
import { PhoneInput } from '@/components/custom/phone-input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { clientStatus } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { clientSchema } from '@/validators/client'
import type { ClientSchemaType } from '@/validators/client'

export default function CreateClientClientPage() {
  const toast = useToast()
  const createUserTranslations = useTranslations('dashboard.createClient')

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'active'
    }
  })

  async function onSubmit(data: ClientSchemaType) {
    try {
      const result = await createClient(data)

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
                  {createUserTranslations('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>{createUserTranslations('breadcrumb.create')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>{createUserTranslations('form.title')}</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{createUserTranslations('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={createUserTranslations('form.name.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{createUserTranslations('form.email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder={createUserTranslations('form.email.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start'>
                    <FormLabel className='text-left'>
                      {createUserTranslations('form.phone.label')}
                    </FormLabel>
                    <FormControl className='w-full relative'>
                      <PhoneInput
                        placeholder={createUserTranslations('form.phone.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{createUserTranslations('form.status.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='rtl:rtl'>
                          <SelectValue
                            placeholder={createUserTranslations('form.status.placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='rtl:rtl'>
                        <SelectItem value={clientStatus.ACTIVE}>
                          {createUserTranslations('form.status.options.active')}
                        </SelectItem>
                        <SelectItem value={clientStatus.DEACTIVE}>
                          {createUserTranslations('form.status.options.deactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant='pressable' className='w-full'>
                {createUserTranslations('form.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
