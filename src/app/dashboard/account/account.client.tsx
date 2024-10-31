'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { settings } from '@/actions/settings'
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
import { Switch } from '@/components/ui/switch'
import { UserRole, UserSession } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'
import { SettingsSchema } from '@/validators/settings'

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
      newPassword: '',
      role: (user.role as UserRole) || 'Employee',
      isTwoFactorEnabled: user.isTwoFactorEnabled || false
    }
  })

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(async () => {
      try {
        const data = await settings(values)
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='******' type='password' disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='******' type='password' disabled={isPending} />
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
                          <SelectItem value={UserRole.USER}>User</SelectItem>
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
                        Enable two factor authentication for your account
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

            <Button disabled={isPending} variant='confirm'>
              Save
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
