import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export type Locale = (typeof locales)[number]

export const locales = ['en', 'ar'] as const
export const defaultLocale: Locale = 'en'

export const routing = defineRouting({
  locales,
  defaultLocale: locales[0],
  localePrefix: 'never'
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
