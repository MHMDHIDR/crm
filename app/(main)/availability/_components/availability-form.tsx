'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { updateAvailability } from '@/actions/availability'
import { availabilitySchema } from '@/app/lib/validators'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useFetch from '@/hooks/use-fetch'
import { timeSlots } from '../data'

export default function AvailabilityForm({ initialData }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { ...initialData }
  })

  const { loading, error, fn: fnupdateAvailability } = useFetch(updateAvailability)

  const onSubmit = async data => {
    await fnupdateAvailability(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
        const isAvailable = watch(`${day}.isAvailable`)

        return (
          <Label key={day} className='flex items-center space-x-4 mb-4' htmlFor={day}>
            <Controller
              name={`${day}.isAvailable`}
              control={control}
              render={({ field }) => (
                <Checkbox
                  id={day}
                  checked={field.value}
                  onCheckedChange={(checked: boolean) => {
                    setValue(`${day}.isAvailable`, checked)
                    if (!checked) {
                      setValue(`${day}.startTime`, '09:00')
                      setValue(`${day}.endTime`, '17:00')
                    }
                  }}
                />
              )}
            />
            <span className='w-24'>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
            {isAvailable && (
              <>
                <Controller
                  name={`${day}.startTime`}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-32'>
                        <SelectValue placeholder='Start Time' />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <span>to</span>
                <Controller
                  name={`${day}.endTime`}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-32'>
                        <SelectValue placeholder='End Time' />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors[day]?.['endTime'] && (
                  <span className='text-red-500 text-sm ml-2'>
                    {errors[day]['endTime'].message}
                  </span>
                )}
              </>
            )}
          </Label>
        )
      })}
      <div className='flex items-center space-x-4'>
        <span className='w-48'>Minimum gap before booking (minutes):</span>

        <Input
          type='number'
          {...register('timeGap', {
            valueAsNumber: true
          })}
          className='w-32'
        />

        {errors.timeGap && (
          <span className='text-red-500 text-sm'>
            {errors.timeGap.message as string} {/* Ensure message is treated as a string */}
          </span>
        )}
      </div>
      {error && <div className='text-red-500 text-sm'>{error?.message as string}</div>}{' '}
      {/* Ensure message is treated as a string */}
      <Button type='submit' disabled={loading}>
        {loading ? 'Updating...' : 'Update Availability'}
      </Button>
    </form>
  )
}
