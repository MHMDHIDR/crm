'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createEmployee } from '@/actions/employees'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { employeeSchema } from '@/validators/employee'
import type { EmployeeSchemaType } from '@/validators/employee'

export default function CreateEmployeeForm() {
  const toast = useToast()

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'employee',
      comissionPercentage: 0,
      salaryAmount: 0,
      username: '',
      password: '',
      fullName: '',
      nationality: '',
      startWorkingDate: '',
      personalIdNumber: 0,
      passportIdNumber: '',
      finalWorkingDate: '',
      contractEndDate: '',
      residencyEndDate: ''
    }
  })

  async function onSubmit(data: EmployeeSchemaType) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    const result = await createEmployee(formData)

    if (!result.success) {
      result.errors?.forEach(error => {
        toast.error(error.message)
      })
      return
    }

    toast.success('Employee created successfully')
  }

  const session = useSession()

  if (!session || !session.data?.user) {
    redirect('/signin')
  }

  return !session || !session.data?.user ? null : (
    <div className='p-6 mx-auto max-w-2xl'>
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
        <span className='mt-4'>⚡ Create New Employee ⚡</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* System Info Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>System Information</h3>

              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='johndoe' {...field} />
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
                      <Input type='password' {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a role' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='employee'>Employee</SelectItem>
                        <SelectItem value='admin'>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Info Section */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Personal Information</h3>

              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='nationality'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='startWorkingDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Working Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Info Section */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='personalIdNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal ID Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='passportIdNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salaryAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='comissionPercentage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Optional Dates Section */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='finalWorkingDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Working Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contractEndDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract End Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='residencyEndDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residency End Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-between items-center'>
            <Link href='/'>
              <Button variant='outline'>Cancel</Button>
            </Link>
            <Button type='submit'>Create Employee</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
