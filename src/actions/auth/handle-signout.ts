'use server'

import { addEvent } from '@/actions/events/add-event'
import { auth, signOut } from '@/auth'

export async function handleSignout() {
  const session = await auth()
  const user = session?.user

  await addEvent(`${user?.name || user?.email} signed out`)

  await signOut()
}
