import { createHash } from 'crypto'

/**
 * Hash a password using SHA-256
 * @param password The password to hash
 * @returns The hashed password
 * @example
 * ```ts
 * const hashedPassword = hashedString('password')
 * ```
 */
export function hashedString(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}
