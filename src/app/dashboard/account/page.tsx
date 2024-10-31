import { auth } from '@/auth'
import { UserSession } from '@/db/schema'
import AccountClientPage from './account.client'

export default async function AccountPage() {
  const session = await auth()

  const user = session?.user as UserSession

  return <AccountClientPage user={user} />
}
