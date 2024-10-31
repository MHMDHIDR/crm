import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 * @param password The password to hash
 * @returns The hashed password
 * @example
 * ```ts
 * const hashedPassword = hashedString('password')
 * ```
 */
export function hashedString(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/**
 * Compare a password with a hashed password
 * @param password The password to compare
 * @param hashedPassword The hashed password to compare against
 */
export function compareHashedStrings(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}
