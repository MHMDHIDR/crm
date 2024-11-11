'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { updateUser } from '@/actions/users/update-user'
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
import { UserRole, UserSession } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

export default function AccountClientPage({ user }: { user: UserSession }) {
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()
  const toast = useToast()
  const dashboardAccountTranslation = useTranslations('dashboard.account')

  // State to hold the user data
  const [userData, setUserData] = useState(user)

  const form = useForm({
    defaultValues: {
      name: userData.name || '',
      email: userData.email || '',
      password: '',
      role: userData.role || 'Employee',
      isTwoFactorEnabled: userData.isTwoFactorEnabled || false
    }
  })

  // Update form values if userData changes
  useEffect(() => {
    form.reset({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role,
      isTwoFactorEnabled: userData.isTwoFactorEnabled ?? false
    })
  }, [userData, form])

  const onSubmit = (values: any) => {
    startTransition(async () => {
      try {
        const data = await updateUser(values)

        if (data.error) {
          toast.error(data.error)
        } else if (data.success) {
          await update()
          toast.success(data.success)
          // Update local state with new data
          setUserData({ ...userData, ...values })
          form.reset({ password: '', isTwoFactorEnabled: values.isTwoFactorEnabled })
        }
      } catch (error) {
        toast.error('An error occurred')
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
                <BreadcrumbLink href='/dashboard'>
                  {dashboardAccountTranslation('breadcrumb.dashboard')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {dashboardAccountTranslation('breadcrumb.settings')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>
            {dashboardAccountTranslation('settings.title')}
          </h1>
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
                      <FormLabel>
                        {dashboardAccountTranslation('settings.fullName.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder={dashboardAccountTranslation('settings.fullName.placeholder')}
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
                      <FormLabel>{dashboardAccountTranslation('settings.email.label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          type='email'
                          placeholder={dashboardAccountTranslation('settings.email.placeholder')}
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
                      <FormLabel>
                        {dashboardAccountTranslation('settings.password.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={dashboardAccountTranslation('settings.password.placeholder')}
                          type='password'
                          disabled={isPending}
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
                      <FormLabel>{dashboardAccountTranslation('settings.role.label')}</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isPending}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className='rtl:rtl'>
                            <SelectValue
                              placeholder={dashboardAccountTranslation('settings.role.placeholder')}
                            />
                          </SelectTrigger>
                          <SelectContent className='rtl:rtl'>
                            <SelectItem value={UserRole.ADMIN}>
                              {dashboardAccountTranslation('settings.role.options.admin')}
                            </SelectItem>
                            <SelectItem value={UserRole.SUPERVISOR}>
                              {dashboardAccountTranslation('settings.role.options.supervisor')}
                            </SelectItem>
                            <SelectItem value={UserRole.EMPLOYEE}>
                              {dashboardAccountTranslation('settings.role.options.employee')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isTwoFactorEnabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm'>
                      <div className='space-y-0.5'>
                        <FormLabel>
                          {dashboardAccountTranslation('settings.twoFactor.label')}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button disabled={isPending} variant='pressable' className='w-full'>
                {dashboardAccountTranslation('settings.saveButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
