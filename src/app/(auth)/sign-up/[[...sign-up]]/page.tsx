import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            cardBox: 'w-full shadow-none',
            card: 'bg-transparent shadow-none p-0 w-full m-0',
            header: 'hidden',
            footer: 'hidden',
            main: 'flex flex-col gap-6',
            
            // Social buttons
            socialButtonsBlockButton: 'w-full flex items-center justify-center gap-3 bg-surface-container-high border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container-high py-3 rounded-xl transition-all group',
            socialButtonsBlockButtonText: 'text-sm font-medium text-on-surface font-body normal-case',
            socialButtonsBlockButtonArrow: 'hidden',
            
            // Divider
            dividerText: 'text-[10px] uppercase tracking-widest text-outline font-body',
            dividerLine: 'bg-outline-variant/20 h-[1px]',
            
            // Form fields
            formFieldRow: 'space-y-1.5',
            formFieldLabel: 'text-[11px] uppercase tracking-widest text-outline font-bold px-1',
            formFieldInput: 'w-full bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 text-white placeholder:text-outline/50 transition-all pb-2 px-1 outline-none text-sm rounded-none shadow-none focus:outline-none focus:ring-0 focus:border-b-primary',
            formFieldErrorText: 'text-error text-xs px-1',
            
            // Primary button
            formButtonPrimary: 'w-full py-4 bg-gradient-to-br from-[#6C63FF] to-[#4F44E2] text-white rounded-xl font-bold tracking-tight shadow-[0_10px_20px_rgba(108,99,255,0.2)] hover:shadow-[0_15px_30px_rgba(108,99,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all normal-case text-base',
            
            identityPreviewText: 'text-on-surface-variant',
            identityPreviewEditButton: 'text-primary hover:text-primary-container',
          },
        }}
        routing="path"
        path="/sign-up"
      />
      
      <p className="mt-8 text-center text-[11px] text-outline leading-relaxed">
        By entering, you agree to our <Link href="#" className="text-on-surface hover:text-primary transition-colors">Terms of Intelligence</Link> and <Link href="#" className="text-on-surface hover:text-primary transition-colors">Privacy Architecture</Link>.
      </p>
    </>
  )
}
