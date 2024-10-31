'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { authenticate } from '@/actions/auth'
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
import type { UserSchemaType } from '@/validators/user'

// Create a subset of UserSchemaType for sign-in
type SignInData = Pick<UserSchemaType, 'email' | 'password'>

const signInSchema = userSchema.pick({ email: true, password: true })

export default function SignInPage() {
  const toast = useToast()
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  })

  function onSubmit(data: SignInData) {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('email', data.email)
        formData.append('password', data.password)

        const result = await authenticate(formData)

        if (!result.success) {
          toast.error(result.message)
          return
        }

        toast.success(result.message)
      } catch (error) {
        toast.error('An error occurred during sign in')
        console.error('Sign-in error:', error)
      }

      redirect('/dashboard')
    })
  }

  return (
    <div className='p-6 mx-auto max-w-2xl'>
      <div className='mb-8 text-center'>
        <h1 className='text-2xl font-semibold'>Sign In</h1>
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
                  <Input type='email' placeholder='Enter your email' {...field} />
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
                  <Input type='password' placeholder='Enter your password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full'>
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
