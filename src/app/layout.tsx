import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sagevu — Expert Intelligence Platform',
  description:
    'Subscribe to AI and human expert personas. Get exclusive content and direct access.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body className="bg-surface-container-lowest text-on-surface antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
