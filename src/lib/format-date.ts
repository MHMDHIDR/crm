/**
 * A function to format the date and time with appropriate granularity.
 * This function takes a date string and returns a more intuitive, human-readable format.
 * Example: 2022-03-28T00:00:00.000Z => '2 weeks ago'
 * @param date the date string to be formatted
 * @returns the formatted date
 */
export function formatDate(date: string, isNormalDate?: boolean): string {
  if (isNormalDate) {
    const dateOptions = {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const
    }

    return new Date(date).toLocaleDateString('en-US', dateOptions)
  }

  const now = new Date().getTime()
  const givenDate = new Date(date).getTime()
  const diff = now - givenDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  switch (true) {
    case days === 0:
      return 'Today'

    case days === 1:
      return 'Yesterday'

    case days >= 2 && days <= 5:
      return `${days} days ago`

    case days >= 6 && days <= 12:
      return `${weeks} weeks ago`

    case days >= 13 && days <= 17:
      return `${weeks} weeks ago`

    case weeks > 2 && weeks < 4:
      return '3 weeks ago'

    case days >= 25 && days <= 35:
      return '1 month ago'

    case months >= 2 && months <= 11:
      return `${months} months ago`

    case years === 1:
      return '1 year ago'

    case years > 1:
      return `${years} years ago`

    default:
      return `${days} days ago`
  }
}

/**
 * Get a formatted date string for the current date or a specified number of days ago.
 * @param sub Number of days to subtract from the current date (optional, default is 0)
 * @returns Formatted date string in 'dd/MM/yyyy' format
 */
export function getDate(sub: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - sub)
  return formatDateToString(date)
}

/**
 * Format a Date object to a string in 'dd/MM/yyyy' format
 * @param date Date object to format
 * @returns Formatted date string
 */
function formatDateToString(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Parse a date string in 'dd/MM/yyyy' format to a Date object
 * @param dateString Date string in 'dd/MM/yyyy' format
 * @param format Format string (unused, kept for compatibility)
 * @param baseDate Base date (unused, kept for compatibility)
 * @returns Parsed Date object
 */
export function parse(dateString: string, format: string, baseDate: Date): Date {
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Compare two dates
 * @param dateA First date
 * @param dateB Second date
 * @returns 1 if dateA is later, -1 if dateB is later, 0 if equal
 */
export function compareDates(dateA: Date, dateB: Date): number {
  if (dateA > dateB) return 1
  if (dateA < dateB) return -1
  return 0
}
