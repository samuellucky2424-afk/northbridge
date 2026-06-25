import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Briefcase, Users, Receipt, Globe, Zap, Shield, ArrowRight, Check } from 'lucide-react'

export default function BusinessPage() {
  const features = [
    { icon: Users, title: 'Multi-User Access', desc: 'Add up to 50 team members with custom permission levels. Control who can view, spend, and approve.' },
    { icon: Receipt, title: 'Integrated Invoicing', desc: 'Create, send, and track invoices directly from your account. Get paid faster with automatic reminders.' },
    { icon: Globe, title: 'Multi-Currency', desc: 'Hold, send, and receive in 30+ currencies with competitive exchange rates and low conversion fees.' },
    { icon: Zap, title: 'Instant Payments', desc: 'Send and receive Faster Payments instantly, 24/7. No delays, no waiting.' },
    { icon: Briefcase, title: 'Dedicated Manager', desc: 'A dedicated relationship manager who understands your business and is always on hand to help.' },
    { icon: Shield, title: 'Fraud Protection', desc: 'Advanced fraud detection and prevention systems protect your business around the clock.' },
  ]

  const plans = [
    { name: 'Business Starter', price: 'Free', desc: 'For sole traders and small businesses', features: ['1 user', '\u00A3100k annual turnover', 'Free UK transfers', 'Basic invoicing', 'Standard support'] },
    { name: 'Business Pro', price: '\u00A312/mo', desc: 'For growing businesses', features: ['Up to 10 users', 'Unlimited turnover', 'Free international transfers', 'Advanced invoicing', 'Priority support', 'Multi-currency'] },
    { name: 'Enterprise', price: 'Custom', desc: 'For large organisations', features: ['Unlimited users', 'Unlimited turnover', 'Bespoke solutions', 'API access', 'Dedicated manager', 'SLA guarantee'] },
  ]

  return (
    <PageLayout
      title="Business Banking"
      subtitle="Multi-user access, integrated invoicing, and dedicated relationship managers."
    >
      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Built for modern businesses</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">From freelancers to enterprises, North Bridge Bank Business gives you the tools to manage money smarter.</p>
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

      {/* Plans */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Simple, transparent pricing</h2>
            <p className="text-[#64748B]">Choose the plan that fits your business. No hidden fees.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 ${i === 1 ? 'ring-2 ring-[#D31111]' : ''}`}>
                {i === 1 && <span className="inline-block px-3 py-1 bg-[#D31111] text-white text-xs font-medium rounded-full mb-4">Most Popular</span>}
                <h3 className="font-display text-xl text-[#0A1628] mb-1">{p.name}</h3>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="font-display text-3xl text-[#D31111]">{p.price}</span>
                  {p.price !== 'Free' && p.price !== 'Custom' && <span className="text-sm text-[#64748B]">/month</span>}
                </div>
                <p className="text-sm text-[#64748B] mb-6">{p.desc}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center space-x-2">
                      <Check size={14} className="text-[#10B981] flex-shrink-0" />
                      <span className="text-sm text-[#64748B]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${i === 1 ? 'btn-primary' : 'border border-light text-[#64748B] hover:border-[#D31111] hover:text-[#D31111]'}`}>
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Briefcase size={48} className="text-[#D31111] mx-auto mb-6" />
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Ready to upgrade your business banking?</h2>
          <p className="text-[#64748B] mb-8">Open a business account in minutes. All you need is your company registration number.</p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
            <span>Open business account</span><ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
