import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface PageLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  heroBg?: string
}

export default function PageLayout({ children, title, subtitle, heroBg = 'bg-[#0A1628]' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className={`${heroBg} relative overflow-hidden py-24`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(211,17,17,0.1)_0%,_transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <span className="label-ui text-[#D31111] mb-3 block">NORTH BRIDGE BANK</span>
            <h1 className="font-display text-5xl text-white mb-4">{title}</h1>
            <p className="text-lg text-[#64748B] font-light max-w-xl">{subtitle}</p>
          </div>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  )
}
