import { Locale } from '@/i18n/routing'

type formatDateOptions = {
  date: string
  locale?: Locale
  isNormalDate?: boolean
  isFullTimestamp?: boolean
}

/**
 * A function to format the date and time with appropriate granularity.
 * This function takes a date string and returns a more intuitive, human-readable format.
 * Handles both past and future dates appropriately.
 * Examples:
 * - Future date: "2 days left"
 * - Past date: "2 days ago"
 * @param date the date string to be formatted
 * @returns the formatted date
 */
export function formatDate({
  date,
  locale = 'en',
  isNormalDate = true,
  isFullTimestamp = false
}: formatDateOptions): string {
  if (isNormalDate) {
    const dateOptions = {
      year: 'numeric' as const,
      month: 'short' as const,
      day: 'numeric' as const
    }

    return new Date(date).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'ar-EG',
      isFullTimestamp
        ? {
            ...dateOptions,
            hour: 'numeric' as const,
            minute: 'numeric' as const
          }
        : dateOptions
    )
  }

  const now = new Date().getTime()
  const givenDate = new Date(date).getTime()
  const diff = givenDate - now
  const isPast = diff < 0
  const absDays = Math.abs(Math.round(diff / (1000 * 60 * 60 * 24)))
  const absWeeks = Math.abs(Math.round(absDays / 7))
  const absMonths = Math.abs(Math.floor(absDays / 30))
  const absYears = Math.abs(Math.floor(absDays / 365))

  const suffix = isPast ? 'ago' : 'left'

  switch (true) {
    case absDays === 0:
      return 'Today'

    case absDays === 1:
      return isPast ? 'Yesterday' : 'Tomorrow'

    case absDays >= 2 && absDays <= 5:
      return `${absDays} days ${suffix}`

    case absDays >= 6 && absDays <= 10:
      return `${absWeeks} week ${suffix}`

    case absDays >= 10 && absDays <= 14:
      return `${absWeeks} weeks ${suffix}`

    case absDays >= 15 && absDays <= 17:
      return `${absWeeks} weeks ${suffix}`

    case absWeeks > 2 && absWeeks < 4:
      return `3 weeks ${suffix}`

    case absDays >= 25 && absDays <= 35:
      return `1 month ${suffix}`

    case absMonths >= 2 && absMonths <= 11:
      return `${absMonths} months ${suffix}`

    case absYears === 1:
      return `1 year ${suffix}`

    case absYears > 1:
      return `${absYears} years ${suffix}`

    default:
      return `${absDays} days ${suffix}`
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
