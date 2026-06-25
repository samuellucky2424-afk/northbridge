import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { TrendingUp, Target, Clock, Shield, Calculator, Gift, ArrowRight } from 'lucide-react'

export default function SavingsPage() {
  const features = [
    { icon: TrendingUp, title: '4.2% AER', desc: 'Earn one of the highest interest rates on the market with our instant access savings account.' },
    { icon: Target, title: 'Savings Goals', desc: 'Set multiple goals — holiday, emergency fund, new car — and track your progress visually.' },
    { icon: Clock, title: 'Instant Access', desc: 'Withdraw your money anytime with no penalties or notice periods. Your money, your rules.' },
    { icon: Shield, title: 'FSCS Protected', desc: 'Your savings are protected up to &pound;85,000 by the Financial Services Compensation Scheme.' },
    { icon: Calculator, title: 'Interest Calculator', desc: 'See exactly how much interest you will earn with our built-in savings calculator.' },
    { icon: Gift, title: 'Round-Up Savings', desc: 'Round up every purchase to the nearest pound and watch your savings grow automatically.' },
  ]

  return (
    <PageLayout
      title="Savings Account"
      subtitle="Earn 4.2% AER with instant access. No penalties, no notice periods."
    >
      {/* Rate highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#D31111] rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-white/70 text-sm uppercase tracking-wider mb-2">Premier Savings</p>
              <p className="font-display text-7xl text-white mb-4">4.2%</p>
              <p className="text-white/80 text-lg mb-2">AER (variable)</p>
              <p className="text-white/60 text-sm max-w-md mx-auto">Earn more on your savings without locking your money away. Interest calculated daily and paid monthly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Why save with North Bridge Bank?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8">
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

      {/* Example */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">See what you could earn</h2>
          <p className="text-[#64748B] mb-8">Based on our current 4.2% AER rate, here is what your savings could grow to in one year:</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { deposit: '\u00A31,000', interest: '\u00A342' },
              { deposit: '\u00A35,000', interest: '\u00A3210' },
              { deposit: '\u00A310,000', interest: '\u00A3420' },
            ].map((ex, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-6">
                <p className="text-sm text-[#64748B] mb-1">Deposit {ex.deposit}</p>
                <p className="font-display text-2xl text-[#10B981]">+{ex.interest}</p>
                <p className="text-xs text-[#64748B]">interest in 1 year</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Start saving smarter today</h2>
          <p className="text-[#64748B] mb-8">Open a savings account in minutes and start earning 4.2% AER instantly.</p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
            <span>Open savings account</span><ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
