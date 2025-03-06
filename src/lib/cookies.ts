export const getCookie = (name: string): string | boolean | undefined => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  return undefined
}

export const setCookie = (name: string, value: string | boolean) => {
  const date = new Date()
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`
}
