import { headers } from 'next/headers'
import Footer from '@/components/custom/footer'
import Nav from '@/components/custom/nav'
import { Providers } from '@/providers'
import './globals.css'

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const pathname = new URL(headersList.get('referer') || '').pathname

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background'>
        <Providers>
          {pathname !== '/dashboard' && <Nav />}
          {children}
          {pathname !== '/dashboard' && <Footer />}
        </Providers>
      </body>
    </html>
  )
}
