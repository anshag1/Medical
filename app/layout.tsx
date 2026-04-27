import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME ?? 'MediCatalogue',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'MediCatalogue'}`,
  },
  description: 'Comprehensive medical product catalogue — browse medicines by category, form, and manufacturer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
