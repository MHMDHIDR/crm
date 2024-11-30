import { UserSession } from '@/db/schema'

/**
 * This function takes a username and returns a fallback username
 * Which is the first letter of each word in the username
 * @param username
 * @returns
 */
export function fallbackUsername(username: UserSession['name']) {
  return username
    .split(' ')
    .map(name => name[0])
    .join('')
}
