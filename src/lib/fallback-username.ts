import { UserSession } from '@/db/schema'

export function fallbackUsername(username: UserSession['name']) {
  return username
    .split(' ')
    .map(name => name[0])
    .join('')
}
