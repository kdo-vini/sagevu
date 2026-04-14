import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      {/* Dashboard Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 h-16">
        <div className="flex items-center justify-between px-6 h-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-black tracking-tighter text-white hover:text-primary transition-colors duration-200"
            >
              Sagevu
            </Link>
            <nav className="hidden md:flex items-center gap-6" aria-label="Dashboard navigation">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-outline hover:text-white transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/specialist/new"
                className="text-sm font-medium text-outline hover:text-white transition-colors"
              >
                New Specialist
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-outline hover:text-white text-sm transition-colors"
            >
              View Site
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 rounded-full',
                },
              }}
            />
          </div>
        </div>
      </header>

      <div className="pt-16">{children}</div>
    </div>
  )
}
