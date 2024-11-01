'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { settings } from '@/actions/settings'
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
  FormDescription,
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
import { FormChanges, SettingsSchema } from '@/validators/settings'

// Custom hook to track form changes
function useFormChanges(form: any, user: UserSession): FormChanges {
  const [formChanges, setFormChanges] = useState<FormChanges>({
    is2FAToggled: false,
    originalValues: {
      isTwoFactorEnabled: user.isTwoFactorEnabled || false
    }
  })

  useEffect(() => {
    const subscription = form.watch((value: any) => {
      setFormChanges((prev: { originalValues: { isTwoFactorEnabled: any } }) => ({
        ...prev,
        is2FAToggled: value.isTwoFactorEnabled !== prev.originalValues.isTwoFactorEnabled
      }))
    })
    return () => subscription.unsubscribe()
  }, [form])

  return formChanges
}

// Password field validation
function validatePasswordField(values: any, formChanges: FormChanges, form: any) {
  const password = values.password

  if (formChanges.is2FAToggled && !password) {
    form.setError('password', {
      type: 'manual',
      message: 'Password is required to change 2FA settings'
    })
  } else {
    form.clearErrors('password')
  }
}

export default function AccountClientPage({ user }: { user: UserSession }) {
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: (user.role as UserRole) || 'Employee',
      isTwoFactorEnabled: user.isTwoFactorEnabled || false
    }
  })

  // Track form changes
  const formChanges = useFormChanges(form, user)

  // Custom password field validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'password' || name === 'isTwoFactorEnabled') {
        validatePasswordField(value, formChanges, form)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, formChanges])

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(async () => {
      try {
        // Add metadata about form changes
        const data = await settings({
          ...values,
          is2FAToggled: formChanges.is2FAToggled
        })

        if (data.error) {
          toast.error(data.error)
        } else if (data.success) {
          await update()
          toast.success(data.success)
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    })
  }

  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
        <div className='flex gap-2 items-center px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Account Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>⚙️ Settings</h1>
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

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {formChanges.is2FAToggled ? 'Current Password' : 'New Password'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='******'
                          type='password'
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        {formChanges.is2FAToggled
                          ? 'Enter your current password to change 2FA settings'
                          : field.value
                            ? 'Enter a new password to update your account password'
                            : 'Leave blank to keep your current password'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isPending}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select a role' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={UserRole.SUPERVISOR}>Supervisor</SelectItem>
                            <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
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
                    <FormItem className='flex flex-row justify-between items-center p-3 rounded-lg border shadow-sm'>
                      <div className='space-y-0.5'>
                        <FormLabel>Two Factor Authentication</FormLabel>
                        <FormDescription>
                          {field.value
                            ? 'Disable two factor authentication'
                            : 'Enable two factor authentication'}
                        </FormDescription>
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

              <Button disabled={isPending} variant='confirm' className='w-full'>
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
