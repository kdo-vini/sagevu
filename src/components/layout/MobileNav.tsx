'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  href: string
  icon: string
  label: string
}

const navItems: MobileNavItem[] = [
  { href: '/discover', icon: 'explore', label: 'Discover' },
  { href: '/feed', icon: 'dynamic_feed', label: 'Feed' },
  { href: '/messages', icon: 'chat_bubble', label: 'Messages' },
  { href: '/subscriptions', icon: 'auto_awesome', label: 'Subscriptions' },
  { href: '/dashboard', icon: 'person', label: 'Dashboard' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/10 z-50 flex items-center justify-around px-4"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-0.5 p-2"
          >
            <span
              className={cn(
                'material-symbols-outlined text-2xl transition-colors duration-200',
                isActive ? 'text-primary' : 'text-outline'
              )}
              aria-hidden="true"
              style={
                isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
              }
            >
              {item.icon}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
