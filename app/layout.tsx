import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const _inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EVM',
  description:
    'EVM - Online Voting Portal Made by Nitin Sharma',
  generator: 'Nitin Sharma',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: light)'
      },
      {
        url: '/favicon.ico',
        media: '(prefers-color-scheme: dark)'
      },
      {
        url: '/favicon.ico',
        type: 'image/svg+xml'
      }
    ],
    apple: '/favicon.png'
  }
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
