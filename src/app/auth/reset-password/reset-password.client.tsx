'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { reset } from '@/actions/reset'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { userSchema } from '@/validators/user'

// Create reset password schema with optional 2FA code
const resetPasswordSchema = userSchema.pick({ email: true })

type resetPasswordData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordClientPage() {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<resetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' }
  })

  function onSubmit(data: resetPasswordData) {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('email', data.email)

        const result = await reset({ email: formData.get('email') as string })

        if (!result.success) {
          toast.error(result.message)
          return
        }

        toast.success(result.message)
      } catch (error) {
        console.error('Reset Password Error:', error)
        toast.error('An error occurred during resetting password')
      }

      redirect('/auth/signin')
    })
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 rounded-lg p-8 shadow-lg dark:shadow-neutral-800 dark:border dark:border-neutral-800'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>Reset Password</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Please Enter Your Email'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}