'use client'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_0_40px_rgba(196,192,255,0.06)] border-b border-outline-variant/10">
      <nav
        className="flex justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full max-w-screen-2xl mx-auto"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-white hover:text-primary transition-colors duration-200"
          aria-label="Sagevu home"
        >
          Sagevu
        </Link>

        <div className="hidden md:flex gap-12 items-center">
          <Link
            href="/discover"
            className="text-outline hover:text-white transition-colors duration-300 tracking-tighter font-bold"
          >
            Discover
          </Link>
          <Link
            href="/feed"
            className="text-outline hover:text-white transition-colors duration-300 tracking-tighter font-bold"
          >
            Feed
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {isSignedIn && (
            <Link
              href="/messages"
              aria-label="Messages"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] text-outline hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chat_bubble
              </span>
            </Link>
          )}
          <button
            aria-label="Notifications"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] text-outline hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              notifications
            </span>
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'w-10 h-10 rounded-full border border-outline-variant/20',
              },
            }}
          />
        </div>
      </nav>
    </header>
  )
}
