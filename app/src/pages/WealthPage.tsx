import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { TrendingUp, Users, PieChart, Shield, Award, ArrowRight } from 'lucide-react'

export default function WealthPage() {
  const services = [
    { icon: Users, title: 'Dedicated Advisor', desc: 'A personal wealth manager who understands your goals and builds a strategy around your life.' },
    { icon: PieChart, title: 'Bespoke Portfolios', desc: 'Investment portfolios tailored to your risk appetite, time horizon, and financial objectives.' },
    { icon: TrendingUp, title: 'Active Management', desc: 'Our City-based team actively manages your investments, adjusting for market conditions.' },
    { icon: Shield, title: 'Risk Management', desc: 'Sophisticated risk management tools to protect and grow your wealth through market cycles.' },
  ]

  const tiers = [
    { name: 'Wealth Lite', min: '\u00A325,000', features: ['Online portfolio management', 'Quarterly reviews', 'Access to 50+ funds', 'Email support'] },
    { name: 'Wealth Pro', min: '\u00A3100,000', features: ['Dedicated advisor', 'Monthly reviews', 'Access to 200+ funds', 'Priority phone support', 'Tax planning advice'] },
    { name: 'Private Banking', min: '\u00A3500,000', features: ['Bespoke portfolio construction', 'Weekly check-ins', 'Full market access', '24/7 concierge', 'Estate planning', 'Family office services'] },
  ]

  return (
    <PageLayout
      title="Wealth Management"
      subtitle="Bespoke investment portfolios curated by our City-based advisory team."
    >
      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Expert guidance for your wealth</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Whether you are planning for retirement, growing your assets, or preserving wealth for future generations, our team is here to help.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8 flex items-start space-x-5">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                  <s.icon size={22} className="text-[#D31111]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#0A1628] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Choose your level of service</h2>
            <p className="text-[#64748B]">From digital-first to fully bespoke, we have a wealth management option for you.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 ${i === 1 ? 'ring-2 ring-[#D31111]' : ''}`}>
                {i === 1 && (
                  <span className="inline-block px-3 py-1 bg-[#D31111] text-white text-xs font-medium rounded-full mb-4">Most Popular</span>
                )}
                <h3 className="font-display text-2xl text-[#0A1628] mb-1">{t.name}</h3>
                <p className="text-sm text-[#64748B] mb-6">Min. {t.min} invested</p>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f, j) => (
                    <li key={j} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0" />
                      <span className="text-sm text-[#64748B]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-xl border border-[#D31111] text-[#D31111] font-medium text-sm hover:bg-[#D31111] hover:text-white transition-all">
                  Learn more
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award size={48} className="text-[#D31111] mx-auto mb-6" />
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Start your wealth journey</h2>
          <p className="text-[#64748B] mb-8">Book a free consultation with one of our wealth advisors. No obligation, no pressure.</p>
          <Link to="/contact" className="btn-primary inline-flex items-center space-x-2">
            <span>Book consultation</span><ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
