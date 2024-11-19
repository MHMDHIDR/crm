import { getLocale, getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { getUserLanguage } from '@/actions/users/user-language'
import { defaultLocale, Locale } from './routing'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) ?? defaultLocale
  const locale = cookieLocale ?? (await getLocale())

  return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
})
