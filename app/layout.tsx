import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import CreateEventDrawer from '@/components/custom/create-event'
import Footer from '@/components/custom/footer'
import Header from '@/components/custom/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Schedulrr',
  description: ' '
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={inter.className}>
          <Header />
          <main className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>{children}</main>
          <Footer />
          <CreateEventDrawer />
        </body>
      </html>
    </ClerkProvider>
  )
}
