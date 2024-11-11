'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import { Client } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

export default function EditClientPageClient({ client }: { client: Client }) {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()
  const router = useRouter()

  // State to hold the client data
  const [clientData, setClientData] = useState(client)

  const form = useForm({
    defaultValues: {
      id: clientData.id,
      name: clientData.name || '',
      email: clientData.email || '',
      password: ''
    }
  })

  // Update form values if clientData changes
  useEffect(() => {
    form.reset({
      name: clientData.name,
      email: clientData.email,
      password: ''
    })
  }, [clientData, form])

  const onSubmit = (values: any) => {
    // startTransition(async () => {
    //   try {
    //     const data = await updateClient({ id: clientData.id, ...values })
    //     if (data.error) {
    //       toast.error(data.error)
    //     } else if (data.success) {
    //       toast.success(data.success)
    //       // Update local state with new data
    //       setClientData({ ...clientData, ...values })
    //       router.refresh() // Refreshes the page
    //     }
    //   } catch (error) {
    //     toast.error('An error occurred')
    //   }
    // })
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
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Client</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>👤 Edit Client</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='space-y-2' onSubmit={form.handleSubmit(onSubmit)}>
              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder='Enter full name' />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          type='email'
                          placeholder='Enter email address'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button disabled={isPending} variant='pressable' className='w-full'>
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
