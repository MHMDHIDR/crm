'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { fetchSupervisors, SupervisorType } from '@/actions/users/get-users'
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
import { User, UserRole } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from '@/i18n/routing'

export default function EditUserPageClient({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()
  const router = useRouter()

  // State to hold the user data
  const [userData, setUserData] = useState(user)
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

  const form = useForm({
    defaultValues: {
      id: userData.id,
      name: userData.name || '',
      email: userData.email || '',
      password: '',
      role: userData.role || 'Employee',
      supervisorId: userData.supervisorId,
      isTwoFactorEnabled: userData.isTwoFactorEnabled || false
    }
  })

  useEffect(() => {
    form.reset({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role ?? 'Employee',
      isTwoFactorEnabled: userData.isTwoFactorEnabled ?? false,
      supervisorId: userData.supervisorId
    })
  }, [userData, form])

  const onSubmit = (values: any) => {
    startTransition(async () => {
      try {
        const data = await updateUser({ id: userData.id, ...values })

        if (data.error) {
          toast.error(data.error)
        } else if (data.success) {
          toast.success(data.success)
          // Update local state with new data
          setUserData({ ...userData, ...values })
          router.refresh() // Refreshes the page
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
                <BreadcrumbLink href='/dashboard'>Main Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden sm:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit User</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Card>
        <CardHeader>
          <h1 className='text-2xl font-bold text-center'>👤 Edit User</h1>
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
                  name='supervisorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor</FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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

                <FormField
                  control={form.control}
                  name='isTwoFactorEnabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between p-3 border rounded-lg shadow-sm'>
                      <div className='space-y-0.5'>
                        <FormLabel>Two Factor Authentication</FormLabel>
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
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </SidebarInset>
  )
}
