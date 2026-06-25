import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { ArrowRight, Smartphone, Bell, PiggyBank, Globe, Zap, Shield } from 'lucide-react'

export default function CurrentAccountPage() {
  const features = [
    { icon: Smartphone, title: 'Mobile Banking', desc: 'Manage your money on the go with our award-winning app.' },
    { icon: Bell, title: 'Instant Notifications', desc: 'Get real-time alerts for every transaction and payment.' },
    { icon: PiggyBank, title: 'Round-Up Savings', desc: 'Automatically round up purchases and save the spare change.' },
    { icon: Globe, title: 'Free UK Transfers', desc: 'Send money to any UK bank account instantly and for free.' },
    { icon: Zap, title: 'Contactless Payments', desc: 'Apple Pay, Google Pay, and contactless card included.' },
    { icon: Shield, title: 'FSCS Protected', desc: 'Your money is protected up to &pound;85,000.' },
  ]

  const fees = [
    { feature: 'Monthly account fee', value: 'Free' },
    { feature: 'UK bank transfers', value: 'Free' },
    { feature: 'Contactless payments', value: 'Free' },
    { feature: 'ATM withdrawals (UK)', value: 'Free' },
    { feature: 'Overdraft buffer', value: '\u00A320' },
    { feature: 'Card replacement', value: '\u00A35' },
  ]

  return (
    <PageLayout
      title="Current Account"
      subtitle="Fee-free everyday banking with instant notifications and smart savings tools."
    >
      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Everything you need, nothing you do not</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Our current account is designed around how you actually live — simple, transparent, and packed with useful features.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-5">
                  <f.icon size={22} className="text-[#D31111]" />
                </div>
                <h3 className="font-display text-xl text-[#0A1628] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Simple, transparent fees</h2>
            <p className="text-[#64748B]">No hidden charges. No surprises.</p>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden">
            {fees.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-light last:border-0">
                <span className="text-sm text-[#64748B]">{f.feature}</span>
                <span className={`text-sm font-medium ${f.value === 'Free' ? 'text-[#10B981]' : 'text-[#0A1628]'}`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Open your account today</h2>
          <p className="text-[#64748B] mb-8">It takes less than 5 minutes. No credit check, no paperwork.</p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
            <span>Apply now</span><ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
