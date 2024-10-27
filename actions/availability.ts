'use server'

import { auth } from '@clerk/nextjs/server'
import { addDays, addMinutes, format, isBefore, parseISO, startOfDay } from 'date-fns'
import { db } from '@/lib/prisma'

export async function getUserAvailability() {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availability: {
        include: { days: true }
      }
    }
  })

  if (!user || !user.availability) {
    return null
  }

  // Transform the availability data into the format expected by the form
  const availabilityData = { timeGap: user.availability.timeGap }

  ;['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    const dayAvailability = user.availability.days.find(
      (d: { day: string }) => d.day === day.toUpperCase()
    )

    availabilityData[day] = {
      isAvailable: !!dayAvailability,
      startTime: dayAvailability ? dayAvailability.startTime.toISOString().slice(11, 16) : '09:00',
      endTime: dayAvailability ? dayAvailability.endTime.toISOString().slice(11, 16) : '17:00'
    }
  })

  return availabilityData
}

interface DayAvailability {
  isAvailable: boolean
  startTime: string
  endTime: string
}

interface AvailabilityFormData {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
  timeGap: number
}

export async function updateAvailability(data: AvailabilityFormData) {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { availability: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Filter out timeGap and only process day entries
  const availabilityData = Object.entries(data)
    .filter(([key, _]) => key !== 'timeGap')
    .flatMap(([day, value]) => {
      const dayData = value as DayAvailability

      if (dayData.isAvailable) {
        const baseDate = new Date().toISOString().split('T')[0]
        return [
          {
            day: day.toUpperCase(),
            startTime: new Date(`${baseDate}T${dayData.startTime}:00Z`),
            endTime: new Date(`${baseDate}T${dayData.endTime}:00Z`)
          }
        ]
      }
      return [] // Return empty array instead of undefined for non-available days
    })
    .filter(Boolean)

  const timeGap = data.timeGap

  if (user.availability) {
    await db.availability.update({
      where: { id: user.availability.id },
      data: {
        timeGap,
        days: {
          deleteMany: {},
          create: availabilityData
        }
      }
    })
  } else {
    await db.availability.create({
      data: {
        userId: user.id,
        timeGap,
        days: {
          create: availabilityData
        }
      }
    })
  }

  return { success: true }
}

export async function getEventAvailability(eventId: any) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      user: {
        include: {
          availability: {
            select: {
              days: true,
              timeGap: true
            }
          },
          bookings: {
            select: {
              startTime: true,
              endTime: true
            }
          }
        }
      }
    }
  })

  if (!event || !event.user.availability) {
    return []
  }

  const { availability, bookings } = event.user
  const startDate = startOfDay(new Date())
  const endDate = addDays(startDate, 30) // Get availability for the next 30 days

  const availableDates = []

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = format(date, 'EEEE').toUpperCase()
    const dayAvailability = availability?.days?.find((d: { day: string }) => d.day === dayOfWeek)

    if (dayAvailability) {
      const dateStr = format(date, 'yyyy-MM-dd')

      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        event.duration,
        bookings,
        dateStr,
        availability.timeGap
      )

      availableDates.push({
        date: dateStr,
        slots
      })
    }
  }

  return availableDates
}

function generateAvailableTimeSlots(
  startTime: { toISOString: () => string | any[] },
  endTime: { toISOString: () => string | any[] },
  duration: number,
  bookings: any[],
  dateStr: string,
  timeGap = 0
) {
  const slots = []
  let currentTime = parseISO(`${dateStr}T${startTime.toISOString().slice(11, 16)}`)
  const slotEndTime = parseISO(`${dateStr}T${endTime.toISOString().slice(11, 16)}`)

  // If the date is today, start from the next available slot after the current time
  const now = new Date()
  if (format(now, 'yyyy-MM-dd') === dateStr) {
    currentTime = isBefore(currentTime, now) ? addMinutes(now, timeGap) : currentTime
  }

  while (currentTime < slotEndTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000)

    const isSlotAvailable = !bookings.some((booking: { startTime: any; endTime: any }) => {
      const bookingStart = booking.startTime
      const bookingEnd = booking.endTime
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      )
    })

    if (isSlotAvailable) {
      slots.push(format(currentTime, 'HH:mm'))
    }

    currentTime = slotEnd
  }

  return slots
}
