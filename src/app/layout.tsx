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
          colorPrimary: '#ffffff', // Minimalist clean primary
          colorBackground: '#0a0a0f', // Match Sagevu lowest surface container
          colorText: '#ffffff',
          colorInputBackground: '#ffffff08', // Super subtle input bg
          colorInputText: '#ffffff',
          borderRadius: '1rem',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          card: 'bg-transparent shadow-none w-full border-none px-0 max-w-[400px] mx-auto',
          headerTitle: 'text-3xl font-bold tracking-tight mb-2',
          headerSubtitle: 'text-white/50 text-base',
          formFieldLabel: 'hidden', // Hides the weird uppercase labels
          formFieldInput: 'h-12 border-white/10 bg-white/5 px-4 text-base placeholder:text-white/30 ring-0 focus:ring-1 focus:ring-white/20 transition-all focus:border-white/20',
          formButtonPrimary: 'h-12 text-black bg-white hover:bg-white/90 font-bold tracking-wide mt-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]',
          dividerLine: 'bg-white/10',
          dividerText: 'text-white/30 font-medium text-xs tracking-wider uppercase',
          socialButtonsBlockButton: 'h-12 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors',
          footerActionText: 'text-white/50',
          footerActionLink: 'text-white font-semibold hover:text-white/80',
          formFieldHintText: 'text-white/40 text-xs mt-1',
          identityPreviewText: 'text-white',
          identityPreviewEditButtonIcon: 'text-white/50 hover:text-white',
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
