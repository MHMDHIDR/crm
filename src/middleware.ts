import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales } from '@/i18n/routing'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Check if the pathname starts with a locale
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // If it doesn't have a locale, use the default middleware behavior
    return intlMiddleware(req)
  }

  // If it already has a locale, let Next.js handle it
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/']
}
