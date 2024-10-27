import React from 'react'
import { getUserAvailability } from '@/actions/availability'
import AvailabilityForm from './_components/availability-form'
import { defaultAvailability } from './data'

export default async function AvailabilityPage() {
  const availability = await getUserAvailability()

  return <AvailabilityForm initialData={availability || defaultAvailability} />
}
