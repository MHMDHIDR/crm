import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'ar'] as const

export const routing = defineRouting({ locales, defaultLocale: 'en', localePrefix: 'as-needed' })

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
