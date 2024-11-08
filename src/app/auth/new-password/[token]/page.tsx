'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { use, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { newPassword } from '@/actions/auth/new-password'
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
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

// Password requirements
const passwordRequirements = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}

// Enhanced password schema with detailed validation
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        passwordRequirements.minLength,
        `Password must be at least ${passwordRequirements.minLength} characters`
      )
      .max(
        passwordRequirements.maxLength,
        `Password must be less than ${passwordRequirements.maxLength} characters`
      )
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    token: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

type NewPasswordData = z.infer<typeof newPasswordSchema>

export default function NewPasswordClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const toast = useToast()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing')
    }
  }, [token, toast])

  const form = useForm<NewPasswordData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '', token }
  })

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= passwordRequirements.minLength) strength += 20
    if (password.match(/[A-Z]/)) strength += 20
    if (password.match(/[a-z]/)) strength += 20
    if (password.match(/[0-9]/)) strength += 20
    if (password.match(/[^A-Za-z0-9]/)) strength += 20
    return strength
  }

  // Watch password field for strength calculation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value.password || ''))
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  async function onSubmit(data: NewPasswordData) {
    startTransition(async () => {
      try {
        const result = await newPassword({
          password: data.password,
          confirmPassword: data.confirmPassword,
          token
        })

        if (!result.success) {
          toast.error(result.message)
          return
        }

        toast.success(result.message)

        // Delay redirect to allow toast to be seen
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
      } catch (error) {
        console.error('New Password Error:', error)
        toast.error('An error occurred while changing password. Please try again.')
      }
    })
  }

  if (!token) return null

  return (
    <div className='flex items-center justify-center min-h-screen px-4 bg-background'>
      <div className='w-full max-w-md p-8 rounded-lg shadow-lg space-y-8 dark:shadow-neutral-800 dark:border dark:border-neutral-800'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold'>Create New Password</h2>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
            Please choose a strong password for your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Enter your new password'
                          className='pr-10'
                        />
                      </FormControl>
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2'
                      >
                        {showPassword ? (
                          <EyeOffIcon className='w-4 h-4 text-gray-500' />
                        ) : (
                          <EyeIcon className='w-4 h-4 text-gray-500' />
                        )}
                      </button>
                    </div>
                    <div className='text-sm text-gray-500'>
                      Password strength:
                      <Progress value={passwordStrength} className='mt-2' />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='Confirm your new password'
                          className='pr-10'
                        />
                      </FormControl>
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2'
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className='w-4 h-4 text-gray-500' />
                        ) : (
                          <EyeIcon className='w-4 h-4 text-gray-500' />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isPending} type='submit' className='w-full'>
              {isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
