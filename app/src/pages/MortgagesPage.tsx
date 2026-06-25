import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Home, TrendingDown, Calculator, Clock, Shield, ArrowRight } from 'lucide-react'

export default function MortgagesPage() {
  const products = [
    { name: 'First-Time Buyer', rate: '4.29%', ltv: 'Up to 90% LTV', desc: 'Step onto the property ladder with our competitive first-time buyer mortgages. Deposit from just 10%.' },
    { name: 'Remortgage', rate: '4.19%', ltv: 'Up to 85% LTV', desc: 'Switch your existing mortgage to North Bridge Bank and potentially save thousands on your monthly payments.' },
    { name: 'Buy-to-Let', rate: '4.69%', ltv: 'Up to 75% LTV', desc: 'Invest in property with our specialist buy-to-let mortgages designed for landlords.' },
    { name: 'Offset Mortgage', rate: '4.39%', ltv: 'Up to 80% LTV', desc: 'Link your savings to your mortgage to reduce the interest you pay while keeping access to your money.' },
  ]

  const why = [
    { icon: TrendingDown, title: 'Competitive Rates', desc: 'Rates from 4.19% fixed for 2, 3, or 5 years.' },
    { icon: Calculator, title: 'No Arrangement Fee', desc: 'We do not charge arrangement fees on any of our mortgages.' },
    { icon: Clock, title: 'Fast Decision', desc: 'Get a Decision in Principle in under 10 minutes.' },
    { icon: Shield, title: 'FCA Regulated', desc: 'All our mortgage advice is fully regulated and impartial.' },
  ]

  return (
    <PageLayout
      title="Mortgages"
      subtitle="Competitive mortgage rates for first-time buyers, remortgages, and buy-to-let."
    >
      {/* Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Find the right mortgage</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Whether you are buying your first home, moving up the ladder, or investing in property, we have a mortgage for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {products.map((p, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8 hover:shadow-soft transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl text-[#0A1628]">{p.name}</h3>
                  <span className="px-3 py-1 bg-[#FEE2E2] text-[#D31111] text-sm font-medium rounded-md">{p.rate}</span>
                </div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">{p.ltv}</p>
                <p className="text-sm text-[#64748B] leading-relaxed mb-6">{p.desc}</p>
                <button className="text-sm font-medium text-[#D31111] flex items-center space-x-1 hover:underline">
                  <span>Learn more</span><ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why North Bridge Bank */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Why choose North Bridge Bank for your mortgage?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {why.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                  <w.icon size={22} className="text-[#D31111]" />
                </div>
                <h3 className="font-display text-lg text-[#0A1628] mb-2">{w.title}</h3>
                <p className="text-sm text-[#64748B]">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Home size={48} className="text-[#D31111] mx-auto mb-6" />
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Ready to find your mortgage?</h2>
          <p className="text-[#64748B] mb-8">Get a Decision in Principle in under 10 minutes without affecting your credit score.</p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
            <span>Get started</span><ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
