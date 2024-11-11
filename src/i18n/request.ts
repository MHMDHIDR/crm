import { getLocale, getRequestConfig } from 'next-intl/server'
import { getUserLanguage } from '@/actions/users/user-language'

export default getRequestConfig(async () => {
  const locale = (await getUserLanguage()) ?? (await getLocale())

  return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
})
