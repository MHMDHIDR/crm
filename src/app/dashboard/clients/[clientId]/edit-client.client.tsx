'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { updateClient } from '@/actions/clients/update-client'
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
import { Client } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

// Define a simple type for the form values
type FormValues = {
  name: string
  email: string
  phone: string
  status: 'active' | 'deactivated'
}

export default function EditClientPageClient({ client }: { client: Client }) {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  // State to hold the client data
  const [clientData, setClientData] = useState(client)

  const form = useForm<FormValues>({
    defaultValues: {
      name: clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      status: clientData.status || 'active'
    }
  })

  // Update form values if clientData changes
  useEffect(() => {
    form.reset({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      status: clientData.status
    })
  }, [clientData, form])

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const data = await updateClient({
          id: clientData.id,
          ...values,
          assignedEmployeeId: clientData.assignedEmployeeId
        })

        if (!data.success) {
          toast.error(data.message || 'Error updating client')
        } else if (data.success) {
          toast.success(data.message)
          // Update local state with new data
          setClientData({ ...clientData, ...values })
        }
      } catch (error) {
        console.log('error -->', error)
        toast.error(`Error ${JSON.stringify(error)}`)
      }
    })
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
                <BreadcrumbLink href='/dashboard/clients'>Clients</BreadcrumbLink>
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
          <h1 className='text-2xl font-bold text-center'>👥 Edit Client</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder='Enter client name' />
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
                        placeholder='Enter client email'
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
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl className='w-full'>
                      <PhoneInput placeholder='Enter phone number' {...field} />
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select client status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='deactivated'>Deactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} variant='pressable' className='w-full'>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
