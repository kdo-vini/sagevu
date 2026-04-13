'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/discover', label: 'Discover', icon: 'explore' },
  { href: '/feed', label: 'Feed', icon: 'dynamic_feed' },
  { href: '/messages', label: 'Messages', icon: 'chat_bubble' },
  { href: '/subscriptions', label: 'Subscriptions', icon: 'auto_awesome' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col py-8 h-screen w-72 fixed left-0 border-r border-outline-variant/20 bg-surface-container-lowest z-40"
      aria-label="Side navigation"
    >
      <div className="px-8 mb-8">
        <Link
          href="/discover"
          className="text-2xl font-black tracking-tighter text-white hover:text-primary transition-colors duration-200"
          aria-label="Sagevu home"
        >
          Sagevu
        </Link>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-4 px-6 py-4 font-medium text-sm transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border-l-4 border-primary'
                  : 'text-outline hover:bg-surface-container-high hover:text-white border-l-4 border-transparent'
              )}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 mt-auto space-y-3">
        <Link
          href="/dashboard"
          className="block w-full py-3 px-4 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-bold text-sm text-center hover:bg-surface-variant transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/persona/new"
          className="block w-full py-3 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm text-center hover:opacity-90 transition-opacity duration-200"
        >
          Become a Creator
        </Link>
      </div>
    </aside>
  )
}
