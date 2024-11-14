'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createUser } from '@/actions/users/create-user'
import { fetchSupervisors, SupervisorType } from '@/actions/users/get-users'
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
import { UserRole, UserSession } from '@/db/schema'
import { env } from '@/env'
import { useToast } from '@/hooks/use-toast'

export default function CreateUserClientPage() {
  const toast = useToast()
  const dashboardUserTranslation = useTranslations('dashboard.createUser')

  const [supervisors, setSupervisors] = useState<SupervisorType[]>([])

  useEffect(() => {
    const getSupervisors = async () => {
      try {
        const supervisors: SupervisorType[] = await fetchSupervisors()
        setSupervisors(supervisors)
      } catch (error) {
        console.error('We can NOT get Supervisors at the moment, please try again!')
      }
    }
    getSupervisors()
  }, [])

  const form = useForm<UserSession & { password: string }>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Employee',
      supervisorId: '',
      image: env.NEXT_PUBLIC_LOGO_URL
    }
  })

  async function onSubmit(data: UserSession & { password: string }) {
    try {
      const result = await createUser(data)

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
                  {dashboardUserTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>{dashboardUserTranslation('breadcrumb.create')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>
            {dashboardUserTranslation('form.title')}
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
                    <FormLabel>{dashboardUserTranslation('form.name.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dashboardUserTranslation('form.name.placeholder')}
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
                    <FormLabel>{dashboardUserTranslation('form.email.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder={dashboardUserTranslation('form.email.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardUserTranslation('form.password.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={dashboardUserTranslation('form.password.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardUserTranslation('form.role.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='rtl:rtl'>
                          <SelectValue
                            placeholder={dashboardUserTranslation('form.role.placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='rtl:rtl'>
                        <SelectItem value={UserRole.ADMIN}>
                          {dashboardUserTranslation('form.role.options.admin')}
                        </SelectItem>
                        <SelectItem value={UserRole.SUPERVISOR}>
                          {dashboardUserTranslation('form.role.options.supervisor')}
                        </SelectItem>
                        <SelectItem value={UserRole.EMPLOYEE}>
                          {dashboardUserTranslation('form.role.options.employee')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='supervisorId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dashboardUserTranslation('form.supervisor.label')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='rtl:rtl'>
                          <SelectValue placeholder='Select a Supervisor' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='rtl:rtl'>
                        {supervisors.map(supervisor => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant='pressable' className='w-full'>
                {dashboardUserTranslation('form.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
