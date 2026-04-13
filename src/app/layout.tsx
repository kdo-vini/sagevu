import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sagevu — Expert Intelligence Platform',
  description:
    'Subscribe to AI and human expert personas. Get exclusive content, direct messaging, and unparalleled access.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8781FF',
          colorBackground: '#1F1F22',
          colorText: '#E5E1E6',
          colorInputBackground: '#2A2A2D',
          colorInputText: '#E5E1E6',
          borderRadius: '0.75rem',
          fontFamily: 'Inter, sans-serif',
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            rel="stylesheet"
          />
        </head>
        <body className="bg-surface-container-lowest text-on-surface antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
