'use server'

import { signOut } from '@/auth'

export async function handleSignout() {
  await signOut()
}
