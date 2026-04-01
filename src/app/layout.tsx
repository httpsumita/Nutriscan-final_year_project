import '../styles/globals.css'
import React from 'react'
import { Providers } from './providers'

export const metadata = {
  title: 'NutriScan',
  description: 'Personalized hormonal health nutrition platform'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
