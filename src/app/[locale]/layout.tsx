import { Analytics } from '@vercel/analytics/react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getUserLanguage } from '@/actions/users/user-language'
import { routing } from '@/i18n/routing'
import { Providers } from '@/providers'
import type { Locale } from '@/i18n/request'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const language = await getUserLanguage()
  const locale = language ?? (await params).locale

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale ?? 'en'} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background' suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
