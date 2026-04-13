'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSignIn = pathname.includes('/sign-in')

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/30 relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] blur-3xl opacity-60 bg-[radial-gradient(circle,rgba(108,99,255,0.08)_0%,rgba(108,99,255,0)_70%)]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] blur-3xl opacity-40 bg-[radial-gradient(circle,rgba(108,99,255,0.08)_0%,rgba(108,99,255,0)_70%)]"></div>
      </div>

      {/* Header Section */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-[#0E0E11]/80 text-white backdrop-blur-xl shadow-[0_0_40px_rgba(108,99,255,0.06)]">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">Sagevu</Link>
        <div className="flex items-center gap-6">
          <span className="font-['Inter'] text-sm uppercase tracking-widest text-[#918FA1] hover:text-white transition-opacity cursor-pointer">Support</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-32 pb-12 px-4 z-10 w-full">
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          {/* Branding Header */}
          <header className="text-center space-y-2">
            <h1 className="text-white text-4xl font-bold tracking-tight">The Digital Polymath.</h1>
            <p className="text-on-surface-variant text-sm tracking-wide">Enter the ecosystem of high-end intelligence.</p>
          </header>

          {/* Auth Card */}
          <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-0 border border-primary/5 rounded-xl pointer-events-none"></div>
            
            {/* Sliding Toggle */}
            <div className="relative bg-surface-container-low p-1 rounded-full flex mb-8">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#6C63FF] rounded-full shadow-lg transition-transform duration-300 transform ${isSignIn ? 'translate-x-0 left-1' : 'translate-x-full left-1'}`}
              ></div>
              <Link href="/sign-in" className={`relative z-10 w-1/2 py-2 text-sm text-center transition-colors ${isSignIn ? 'font-bold text-white' : 'font-medium text-outline hover:text-white'}`}>Sign In</Link>
              <Link href="/sign-up" className={`relative z-10 w-1/2 py-2 text-sm text-center transition-colors ${!isSignIn ? 'font-bold text-white' : 'font-medium text-outline hover:text-white'}`}>Create Account</Link>
            </div>

            {/* Clerk Form Content */}
            <div className="w-full">
              {children}
            </div>

            {/* Terms Area (Hidden from layout to let Clerk handle it, or we can add it here if we remove Clerk's footer completely) */}
          </div>

          {/* Contextual Note */}
          <div className="flex items-center justify-center gap-4 text-outline/40">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">AES-256 Bit Encrypted Security Shell</span>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 w-full py-12 border-t border-[#464555]/20 bg-[#0E0E11] flex flex-col md:flex-row justify-between items-center px-12 gap-6 mt-auto">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-white font-bold text-lg tracking-tight">Sagevu</span>
          <span className="font-['Inter'] text-sm uppercase tracking-widest text-[#918FA1]">© {new Date().getFullYear()} Sagevu. The Digital Polymath.</span>
        </div>
        <div className="flex gap-8">
          <a className="font-['Inter'] text-sm uppercase tracking-widest text-[#918FA1] hover:text-white transition-opacity" href="#">Terms</a>
          <a className="font-['Inter'] text-sm uppercase tracking-widest text-[#918FA1] hover:text-white transition-opacity" href="#">Privacy</a>
          <a className="font-['Inter'] text-sm uppercase tracking-widest text-[#918FA1] hover:text-white transition-opacity" href="#">Cookies</a>
        </div>
      </footer>
    </div>
  )
}
