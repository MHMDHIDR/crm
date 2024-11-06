import './globals.css'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  //suppressHydrationWarning
  return (
    <html>
      <head>
        <meta content='width=device-width, initial-scale=1 maximum-scale=1' name='viewport' />
        <link href='/images/logo.svg' rel='icon' type='image/svg+xml' />
      </head>
      <body className='min-h-screen bg-background'>{children}</body>
    </html>
  )
}
