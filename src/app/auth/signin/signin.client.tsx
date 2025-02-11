'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authenticate } from '@/actions/auth/auth'
import { getUserLanguage } from '@/actions/users/user-language'
import { getUserTheme } from '@/actions/users/user-theme'
import { OpenTestUsers } from '@/components/custom/open-test-users'
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
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { UserSession } from '@/db/schema'
import { env } from '@/env'
import { useToast } from '@/hooks/use-toast'
import { Link, redirect } from '@/i18n/routing'
import { useLocale } from '@/providers/locale-provider'
import { userSchema } from '@/validators/user'

// Create signin schema with optional 2FA code
const signInSchema = userSchema.pick({ email: true, password: true }).extend({
  code: z.string().optional()
})

type SignInData = z.infer<typeof signInSchema>

export default function SignInClientPage() {
  const toast = useToast()
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [testUser, setTestUser] = useState({ email: '', password: '' })
  const [isPending, startTransition] = useTransition()
  const { setTheme: setProviderTheme } = useTheme()
  const { setLocale, locale } = useLocale()

  const form = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', code: '' }
  })

  useEffect(() => {
    if (testUser.email && testUser.password) {
      form.setValue('email', testUser.email)
      form.setValue('password', testUser.password)
    }
  }, [testUser, form])

  function onSubmit(data: SignInData) {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('email', data.email)
        formData.append('password', data.password)
        if (data.code) {
          formData.append('code', data.code)
        }

        const result = await authenticate(formData)

        if (result.twoFactor) {
          setShowTwoFactor(true)
          toast.success('2FA code has been sent to your email')
          return
        }

        if (!result.success) {
          toast.error(result.message)
          return
        }

        // Fetch and set theme and locale after successful authentication
        const [userTheme, userLanguage] = await Promise.all([
          getUserTheme(),
          getUserLanguage(result.userId as UserSession['id'])
        ])
        // const userTheme = await getUserTheme()

        setProviderTheme(userTheme || 'light')
        setLocale(userLanguage || 'en')

        toast.success(result.message)
      } catch (error) {
        console.error('Sign-in error:', error)
        toast.error('An error occurred during sign in')
      }

      redirect({ href: env.NEXT_PUBLIC_DEFAULT_REDIRECT, locale })
    })
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-full max-w-md p-8 rounded-lg shadow-lg space-y-8 dark:shadow-neutral-800 dark:border dark:border-neutral-800'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold'>{showTwoFactor ? 'Enter 2FA Code' : 'Sign In'}</h2>
          {showTwoFactor && (
            <p className='mt-2 text-sm text-gray-600'>
              Please enter the verification code sent to your email
            </p>
          )}
        </div>

        {!showTwoFactor && <OpenTestUsers setTestUser={setTestUser} />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {!showTwoFactor ? (
              <>
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

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Please Enter Your Password'
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-center gap-5'>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl className='min-w-full'>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className='min-w-fit sm:w-12 md:w-14' />
                          <InputOTPSlot index={1} className='min-w-fit sm:w-12 md:w-14' />
                          <InputOTPSlot index={2} className='min-w-fit sm:w-12 md:w-14' />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className='min-w-fit sm:w-12 md:w-14' />
                          <InputOTPSlot index={4} className='min-w-fit sm:w-12 md:w-14' />
                          <InputOTPSlot index={5} className='min-w-fit sm:w-12 md:w-14' />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className='w-5 h-5 animate-spin' />
                  Signing Now...
                </>
              ) : showTwoFactor ? (
                'Verify Code'
              ) : (
                'Sign In'
              )}
            </Button>

            {!showTwoFactor && (
              <Link
                href='/auth/reset-password'
                className='inline-flex hover:underline underline-offset-4'
              >
                Forgot password?
              </Link>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
