import { getLocale, getRequestConfig } from 'next-intl/server'
import { getUserLanguage } from '@/actions/users/user-language'
import { routing } from '@/i18n/routing'

export type Locale = (typeof routing.locales)[number]

export default getRequestConfig(async () => {
  const language = await getUserLanguage()
  let locale = language ?? (await getLocale())

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }

  return { locale, messages: (await import(`@/../messages/${locale ?? 'en'}.json`)).default }
})
