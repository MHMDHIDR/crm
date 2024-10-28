'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { redirect } from 'next/navigation'
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
import { signInSchema } from '@/validators/auth'
import type { SignInSchemaType } from '@/validators/auth'

export default function SignInPage() {
  const toast = useToast()

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: '', password: '' }
  })

  async function onSubmit(data: SignInSchemaType) {
    try {
      const formData = new FormData()
      formData.append('username', data.username)
      formData.append('password', data.password)

      const result = await authenticate(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('تم تسجيل الدخول بنجاح')

      redirect('/')
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول')
      console.error('Sign-in error:', error)
    }
  }

  return (
    <div className='p-6 mx-auto max-w-md'>
      <div className='grid mb-8 w-full text-2xl text-center grid-col-1'>
        <div>
          <Image
            className='mr-auto ml-auto'
            src='/images/logo.svg'
            alt='Logo image'
            width={256}
            height={256}
            priority
          />
        </div>
        <span className='mt-4'>تسجيل الدخول</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المستخدم</FormLabel>
                <FormControl>
                  <Input placeholder='ادخل اسم المستخدم' {...field} />
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
                <FormLabel>كلمة المرور</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='ادخل كلمة المرور' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'جاري الدخول...' : 'دخول'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
