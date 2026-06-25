import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, ChevronLeft, ChevronRight, Star,
  Shield, Zap, Clock, Globe, TrendingUp, Lock,
  Smartphone, Award, Landmark, PiggyBank,
  Briefcase, User, ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NumberTicker from '../components/NumberTicker'

gsap.registerPlugin(ScrollTrigger)

/* ─── Curtain Reveal ─── */
function CurtainReveal({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panels = overlayRef.current?.querySelectorAll('.curtain-panel')
    if (!panels || panels.length < 3) return
    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        if (overlayRef.current) overlayRef.current.style.display = 'none'
        onComplete()
      },
    })
    tl.to(panels[0], { xPercent: -100, duration: 1.2, ease: 'power3.inOut' })
    tl.to(panels[1], { yPercent: -100, duration: 1.2, ease: 'power3.inOut' }, '<')
    tl.to(panels[2], { xPercent: 100, duration: 1.2, ease: 'power3.inOut' }, '<')
    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div ref={overlayRef} className="curtain-overlay">
      <div className="curtain-panel curtain-panel-1" />
      <div className="curtain-panel curtain-panel-2" />
      <div className="curtain-panel curtain-panel-3" />
    </div>
  )
}

/* ─── Hero Section ─── */
function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', delay: 1.8 })
      gsap.from(subtitleRef.current, { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out', delay: 2.0 })
      gsap.from(cardsRef.current?.querySelectorAll('.hero-card') || [], {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 2.1,
      })
    })
    return () => ctx.revert()
  }, [])

  const heroCards = [
    { img: '/images/hero-card-1.jpg', label: 'BUSINESS', desc: 'Power your company with integrated banking', tint: 'bg-red-500/10' },
    { img: '/images/hero-card-2.jpg', label: 'PERSONAL', desc: 'Everyday banking that works for you', tint: 'bg-blue-500/10' },
    { img: '/images/hero-card-3.jpg', label: 'WEALTH', desc: 'Grow your assets with expert guidance', tint: '' },
    { img: '/images/hero-card-4.jpg', label: 'PAYMENTS', desc: 'Seamless contactless payments anywhere', tint: '', borderAccent: true },
  ]

  return (
    <section className="min-h-screen pt-16 relative overflow-hidden bg-white">
      {/* Background City Skyline Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/images/hero-bg.jpg" 
          alt="City Skyline" 
          className="w-full h-full object-cover object-center opacity-90 transition-opacity duration-700" 
        />
        {/* Soft bottom-fade gradient overlay to blend into the next white section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white" />
      </div>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0A1628 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-64px)] py-12">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FEE2E2] rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#D31111] animate-pulse" />
              <span className="text-xs font-medium text-[#D31111] uppercase tracking-wider">FCA Regulated UK Bank</span>
            </div>
            <h1 ref={headingRef} className="font-display text-7xl sm:text-8xl lg:text-[96px] text-[#0A1628] leading-none mb-6 opacity-0">
              BANKING
            </h1>
            <p ref={subtitleRef} className="text-lg text-[#64748B] font-light max-w-md mb-4 opacity-0">
              A better place to bank. Award-winning online banking designed for how you live and work.
            </p>
            <p className="text-sm text-[#64748B] max-w-sm mb-8 leading-relaxed">
              Join over 142,000 customers who trust North Bridge Bank with their financial future. From everyday current accounts to bespoke wealth management, we are building the bank Britain deserves.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
                <span>Get started</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm tracking-wide border-2 border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-all duration-200">
                <span>Learn more</span>
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex items-center space-x-6 mt-10">
              {[
                { icon: Shield, label: 'FSCS Protected' },
                { icon: Lock, label: '256-bit Security' },
                { icon: Award, label: 'Award Winning' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <badge.icon size={16} className="text-[#D31111]" />
                  <span className="text-xs text-[#64748B] font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Cards */}
          <div ref={cardsRef} className="grid grid-cols-2 gap-4">
            {heroCards.map((card, i) => (
              <div
                key={i}
                className={`hero-card relative overflow-hidden rounded-2xl shadow-soft opacity-0 group cursor-pointer ${i % 2 === 1 ? 'translate-y-8' : ''} ${card.borderAccent ? 'border-l-4 border-[#D31111]' : ''}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={card.img} alt={card.label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading={i < 2 ? 'eager' : 'lazy'} />
                  {card.tint && <div className={`absolute inset-0 ${card.tint}`} />}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-3">
                  <span className="label-ui text-[#D31111] block mb-0.5">{card.label}</span>
                  <span className="text-xs text-[#64748B]">{card.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-xs text-[#64748B] mb-2">Scroll to explore</span>
        <ChevronDown size={20} className="text-[#64748B]" />
      </div>
    </section>
  )
}

/* ─── Why North Bridge Bank ─── */
function WhySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.why-card', {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [])

  const features = [
    { 
      icon: Shield, 
      title: 'Unwavering Financial Trust', 
      desc: 'As a fully FCA-regulated UK bank, your deposits are protected up to \u00A385,000 under the FSCS. We implement military-grade encryption and biometric authentication to guarantee your funds and data remain completely secure.' 
    },
    { 
      icon: Globe, 
      title: 'Seamless Global Transfers', 
      desc: 'Send and receive money internationally in seconds with real-time tracking, zero hidden charges, and competitive live exchange rates. Our optimized routing protocol ensures 99.9% seamless transaction completion.' 
    },
    { 
      icon: Zap, 
      title: 'Real-Time Transaction Control', 
      desc: 'Track your spending and incoming funds instantly. Receive immediate, secure push notifications and emails for every payment, transfer, and account activity as it happens.' 
    },
    { 
      icon: Smartphone, 
      title: 'Intuitive Mobile Experience', 
      desc: 'Manage your complete financial ecosystem from the palm of your hand. Open accounts, authorize international wire transfers, and monitor investments with a fluid, modern mobile interface.' 
    },
    { 
      icon: Clock, 
      title: '24/7 Premium Support', 
      desc: 'Enjoy round-the-clock access to our professional, UK-based customer care team. Whether via phone, email, or secure in-app chat, we provide instant support when you need it most.' 
    },
    { 
      icon: TrendingUp, 
      title: 'Wealth Growth & Protection', 
      desc: 'Grow your wealth with high-yield savings earning 4.2% AER, automated round-up portfolios, and professional wealth management strategies designed to safeguard your capital.' 
    },
  ]

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-[#0A1628] text-white">
      {/* Background Trust Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/images/trust-bg.png" 
          alt="Trust Background" 
          className="w-full h-full object-cover object-center opacity-45 mix-blend-overlay" 
        />
        {/* Elegant dark gradient overlay to ensure text is fully legible and looks premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/95 via-[#0A1628]/85 to-[#0A1628]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block font-semibold tracking-wider">WHY NORTH BRIDGE BANK</span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-6">Banking Built on Absolute Trust</h2>
          <p className="text-slate-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            At North Bridge Bank, we believe trust is the cornerstone of every financial relationship. 
            We blend rigorous FCA-regulated security with lightning-fast transfer systems, delivering an unmatched banking experience. 
            From instant domestic transfers to zero-fee global payments, your transactions are completely secure, transparent, and seamlessly executed.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="why-card group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#D31111]/50 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#D31111]/10 flex items-center justify-center mb-5 group-hover:bg-[#D31111] transition-colors duration-300">
                <f.icon size={22} className="text-[#D31111] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl text-white mb-3">{f.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.step-card', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [])

  const steps = [
    { step: '01', title: 'Download the app', desc: 'Get North Bridge Bank on iOS or Android. The setup takes less than 5 minutes.' },
    { step: '02', title: 'Verify your identity', desc: 'Quick and secure ID verification using your passport or driving licence.' },
    { step: '03', title: 'Start banking', desc: 'Your account is ready instantly. Add money, set up payments, and go.' },
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block">GET STARTED</span>
          <h2 className="font-display text-4xl text-[#0A1628] mb-4">Open an account in minutes</h2>
          <p className="text-[#64748B] max-w-xl mx-auto">No branch visits. No paperwork. Just your phone and a few minutes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="step-card relative bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D31111] flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-display text-xl">{s.step}</span>
              </div>
              <h3 className="font-display text-xl text-[#0A1628] mb-3">{s.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{s.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-[#D31111]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Counter Section ─── */
function CounterSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const stats = [
    { value: 9.7, prefix: '\u00A3', suffix: 'B', label: 'TOTAL ASSETS', decimals: 1 },
    { value: 142, suffix: 'K', label: 'ACTIVE ACCOUNTS', decimals: 0 },
    { value: 24, suffix: '', label: 'BRANCHES', decimals: 0 },
    { value: 99.8, suffix: '%', label: 'RELIABILITY', decimals: 1 },
  ]

  return (
    <section ref={sectionRef} className="py-32 bg-[#0A1628] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.5)_0%,_transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block">TRUSTED BY THOUSANDS</span>
          <h2 className="font-display text-4xl text-white mb-4">Assets Under Management</h2>
          <p className="text-lg text-[#64748B] font-light max-w-xl mx-auto">
            North Bridge Bank manages portfolios with precision and care. Our growth reflects the trust our customers place in us every single day.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl lg:text-6xl font-light text-white mb-2">
                <NumberTicker value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} duration={2000} />
              </div>
              <div className="w-10 h-0.5 bg-[#D31111] mx-auto mb-3" />
              <span className="label-ui text-[#64748B]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Video Advert ─── */
function VideoAdvert() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(err => console.log('Video play error:', err))
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section className="py-24 bg-[#0A1628] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D31111]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left - Text descriptions with image */}
          <div className="lg:col-span-5 space-y-6">
            <span className="label-ui text-[#D31111]">NBB IN ACTION</span>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight">
              Watch How We're Redefining Modern Banking
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed">
              Explore a quick preview of our award-winning digital platform. See how seamless it is to execute global transfers, track your AUM, and manage multi-currency accounts instantly.
            </p>
            
            {/* Website descriptions with images list */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img src="/images/current-account-promo.png" alt="Current App" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Everyday Account Dashboard</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Real-time alerts, instant card freeze, and biometric security protections.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img src="/images/business-account-promo.png" alt="Business Dash" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Professional Analytics Tools</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Automated accounting integrations, invoicing registers, and smart charts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Video Advert Frame */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 group aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-graphs-and-data-31908-large.mp4"
                loop
                muted
                playsInline
              />
              
              {/* Custom controls overlay */}
              <div className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-6 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                {/* Top indicator */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#D31111] text-xs font-semibold uppercase tracking-wider rounded-md">LIVE DEMO</span>
                  <span className="text-xs text-white/60 font-mono">0:15 Loop</span>
                </div>

                {/* Center play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={handlePlayToggle}
                    className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 hover:bg-[#D31111] hover:border-[#D31111] transition-all duration-300 cursor-pointer shadow-lg"
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>

                {/* Bottom title */}
                <div className="text-left">
                  <p className="text-sm font-medium text-white">North Bridge Bank Platform Overview</p>
                  <p className="text-xs text-white/60">Experience the difference of a digital first bank built around your lifestyle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── 3D Card Carousel ─── */
const accountCards = [
  { title: 'Everyday Current', desc: 'Fee-free banking with instant notifications and built-in savings tools.', icon: Landmark, promoImage: '/images/current-account-promo.png' },
  { title: 'Premier Savings', desc: 'Competitive rates from 4.2% AER with instant access and no penalties.', icon: PiggyBank, promoImage: '/images/savings-account-promo.png' },
  { title: 'Business Pro', desc: 'Multi-user access, integrated invoicing, and dedicated relationship manager.', icon: Briefcase, promoImage: '/images/business-account-promo.png' },
  { title: 'Wealth Management', desc: 'Bespoke investment portfolios curated by our City-based advisory team.', icon: TrendingUp, promoImage: '/images/wealth-management-promo.png' },
  { title: 'Student Starter', desc: 'Zero fees through university, exclusive perks, and graduate overdraft buffer.', icon: User, promoImage: '/images/hero-card-2.jpg' },
]

const cardTransforms = [
  { translateX: '-110%', translateZ: '-200px', rotateY: '25deg', opacity: 1 },
  { translateX: '0%', translateZ: '100px', rotateY: '0deg', opacity: 1 },
  { translateX: '110%', translateZ: '-200px', rotateY: '-25deg', opacity: 1 },
  { translateX: '0%', translateZ: '-500px', rotateY: '0deg', opacity: 0 },
  { translateX: '0%', translateZ: '-500px', rotateY: '0deg', opacity: 0 },
]

function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sceneRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const velocity = useRef(0)
  const lastX = useRef(0)

  const updateTransforms = (index: number) => {
    const cards = sceneRef.current?.querySelectorAll('.carousel-card')
    if (!cards) return
    const ordered = [...cardTransforms.slice(index), ...cardTransforms.slice(0, index)]
    cards.forEach((card, i) => {
      const el = card as HTMLElement
      const t = ordered[i]
      el.style.transform = `translate3d(${t.translateX}, 0, ${t.translateZ}) rotateY(${t.rotateY})`
      el.style.opacity = String(t.opacity)
      el.style.pointerEvents = i === 0 ? 'all' : 'none'
      el.classList.toggle('active', i === 0)
    })
  }

  useEffect(() => { updateTransforms(currentIndex) }, [currentIndex])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    currentX.current = 0
    velocity.current = 0
    lastX.current = e.clientX
    if (sceneRef.current) sceneRef.current.style.transition = 'none'
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaX = e.clientX - startX.current
    currentX.current = deltaX * 1.5
    if (sceneRef.current) sceneRef.current.style.transform = `translateX(${currentX.current}px)`
    velocity.current = e.clientX - lastX.current
    lastX.current = e.clientX
  }
  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (sceneRef.current) {
      sceneRef.current.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
      sceneRef.current.style.transform = 'translateX(0)'
    }
    if (Math.abs(velocity.current) > 30) {
      setCurrentIndex(velocity.current > 0
        ? (currentIndex - 1 + accountCards.length) % accountCards.length
        : (currentIndex + 1) % accountCards.length)
    } else if (currentX.current > 80) {
      setCurrentIndex((currentIndex - 1 + accountCards.length) % accountCards.length)
    } else if (currentX.current < -80) {
      setCurrentIndex((currentIndex + 1) % accountCards.length)
    }
  }

  const goTo = (dir: 'left' | 'right') => {
    setCurrentIndex(dir === 'left'
      ? (currentIndex - 1 + accountCards.length) % accountCards.length
      : (currentIndex + 1) % accountCards.length)
  }

  return (
    <section className="py-32 bg-[#F1F5F9]" id="accounts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block">OUR PRODUCTS</span>
          <h2 className="font-display text-4xl text-[#0A1628] mb-4">Built for Every Stage</h2>
          <p className="text-[#64748B] max-w-xl mx-auto">From your first current account to complex business portfolios, we have an account that fits your life.</p>
        </div>
        <div className="relative flex justify-center">
          <button onClick={() => goTo('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
            <ChevronLeft size={24} className="text-[#0A1628]" />
          </button>
          <div className="carousel-scene w-full max-w-5xl h-[480px] relative select-none"
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            <div ref={sceneRef} className="carousel-scene-inner w-full h-full relative">
              {accountCards.map((card, i) => {
                const CardIcon = card.icon
                return (
                  <div key={i} className="carousel-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[420px] bg-white rounded-2xl border border-light shadow-soft overflow-hidden"
                    style={{ transform: `translate3d(${cardTransforms[i].translateX}, 0, ${cardTransforms[i].translateZ}) rotateY(${cardTransforms[i].rotateY})`, opacity: cardTransforms[i].opacity }}>
                    <div className="h-[55%] relative overflow-hidden">
                      {card.promoImage ? (
                        <img src={card.promoImage} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FEE2E2] to-[#FEF2F2]">
                          <CardIcon size={64} className="text-[#D31111]/20" />
                        </div>
                      )}
                    </div>
                    <div className="h-[45%] p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-xl text-[#0A1628] mb-2">{card.title}</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">{card.desc}</p>
                      </div>
                      <Link to="/current-account" className="inline-flex items-center text-sm font-medium text-[#D31111] group">
                        Learn more <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button onClick={() => goTo('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
            <ChevronRight size={24} className="text-[#0A1628]" />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-card', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [])

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Small Business Owner', location: 'London', text: 'North Bridge Bank transformed how I manage my business finances. The integrated invoicing and multi-user access saved me hours every week. Best business banking decision I ever made.', rating: 5 },
    { name: 'James Whitfield', role: 'Software Engineer', location: 'Manchester', text: 'The app is incredibly intuitive. I opened my account in under 5 minutes and the instant notifications give me complete peace of mind about every transaction.', rating: 5 },
    { name: 'Emily Crawford', role: 'Medical Student', location: 'Birmingham', text: 'As a student, the zero fees and graduate overdraft buffer are a lifesaver. The savings round-up feature has helped me save over \u00A3300 without even thinking about it.', rating: 5 },
    { name: 'Robert Chang', role: 'Investment Consultant', location: 'Edinburgh', text: 'The wealth management service is exceptional. My advisor understands my goals and the portfolio performance has exceeded my expectations quarter after quarter.', rating: 5 },
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block">TESTIMONIALS</span>
          <h2 className="font-display text-4xl text-[#0A1628] mb-4">Loved by 142,000 customers</h2>
          <p className="text-[#64748B] max-w-xl mx-auto">Do not just take our word for it. Here is what our customers have to say about banking with North Bridge Bank.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card bg-[#F8FAFC] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center space-x-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-[#0A1628] leading-relaxed flex-1 mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center space-x-3 pt-4 border-t border-light">
                <div className="w-10 h-10 rounded-full bg-[#D31111]/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#D31111]">{t.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">{t.name}</p>
                  <p className="text-xs text-[#64748B]">{t.role} &middot; {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Bento Grid ─── */
function BentoGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento-card', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-24 bg-white" id="security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="label-ui text-[#D31111] mb-3 block">SECURITY</span>
          <h2 className="font-display text-4xl text-[#0A1628] mb-4">Your Security, Our Priority</h2>
          <p className="text-[#64748B] max-w-xl mx-auto">Bank-grade protection that never sleeps. We employ the most advanced security measures to keep your money and data safe.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="bento-card md:col-span-2 bg-[#F1F5F9] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-soft transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="flex-1 p-8">
                <h3 className="font-display text-2xl text-[#0A1628] mb-2">256-bit Encryption</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">Military-grade encryption protects every transaction and data transfer. The same standard used by the UK government and NATO.</p>
              </div>
              <div className="sm:w-48 lg:w-56 h-48 sm:h-auto flex-shrink-0">
                <img src="/images/bento-encryption.jpg" alt="Encryption" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="bento-card bg-[#F1F5F9] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-soft transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D31111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
            <h3 className="font-display text-xl text-[#0A1628] mb-1">FCA Regulated</h3>
            <p className="text-sm text-[#64748B]">Fully authorised and regulated by the Financial Conduct Authority</p>
          </div>
          {/* Row 2 */}
          <div className="bento-card bg-[#F1F5F9] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-soft transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-[#0A1628]/5 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v3H5v11h14V10h-2V7a5 5 0 0 0-5-5Z" /><circle cx="12" cy="16" r="1" /></svg>
            </div>
            <h3 className="font-display text-xl text-[#0A1628] mb-1">Biometric Login</h3>
            <p className="text-sm text-[#64748B]">Face ID and fingerprint access for maximum security</p>
          </div>
          <div className="bento-card md:col-span-2 bg-[#F1F5F9] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-soft transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="flex-1 p-8">
                <h3 className="font-display text-2xl text-[#0A1628] mb-2">&pound;85,000 FSCS Protection</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">Your deposits are protected up to &pound;85,000 by the Financial Services Compensation Scheme, the UK&apos;s statutory deposit protection.</p>
              </div>
              <div className="sm:w-48 lg:w-56 h-48 sm:h-auto flex-shrink-0">
                <img src="/images/bento-fscs.jpg" alt="FSCS" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              </div>
            </div>
          </div>
          {/* Row 3 */}
          {[
            { title: 'Instant Freeze', desc: 'Freeze cards instantly from your app', icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h0" /></svg>) },
            { title: 'Real-time Alerts', desc: 'Instant notifications for every transaction', icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D31111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>) },
            { title: '24/7 Support', desc: 'Always here when you need us', icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>) },
          ].map((item, i) => (
            <div key={i} className="bento-card bg-[#F1F5F9] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-soft transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-display text-lg text-[#0A1628] mb-1">{item.title}</h3>
              <p className="text-sm text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section className="py-32 bg-[#D31111] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white/10" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-white/10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <span className="label-ui text-white/60 mb-4 block">START TODAY</span>
        <h2 className="font-display text-4xl text-white mb-4">Ready to experience better banking?</h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
          Join 142,000 customers who trust North Bridge Bank with their financial future. Open your account in under 5 minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-[#D31111] font-medium text-sm tracking-wide hover:bg-[#0A1628] hover:text-white transition-all duration-200">
            Open an account
          </Link>
          <Link to="/contact" className="text-white hover:underline text-sm font-medium transition-all">
            Talk to an advisor
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <CurtainReveal onComplete={() => {}} />
      <Navbar />
      <main>
        <HeroSection />
        <WhySection />
        <HowItWorks />
        <CounterSection />
        <VideoAdvert />
        <CardCarousel />
        <Testimonials />
        <BentoGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
