import PageLayout from '../components/PageLayout'
import { TreePine, Leaf, Zap, Recycle } from 'lucide-react'

export default function SustainabilityPage() {
  const initiatives = [
    { icon: TreePine, title: 'Carbon Neutral Operations', desc: 'We have been fully carbon neutral since 2023. All our offices run on 100% renewable energy, and we offset all business travel through verified carbon credits.' },
    { icon: Leaf, title: 'Paperless Banking', desc: 'Our digital-first approach has eliminated over 12 tonnes of paper waste. All statements, documents, and communications are delivered digitally by default.' },
    { icon: Zap, title: 'Green Investment Portfolios', desc: 'Our wealth management team offers ESG-focused investment portfolios that let you grow your wealth while supporting sustainable businesses.' },
    { icon: Recycle, title: 'Card Recycling Programme', desc: 'Return your expired North Bridge Bank cards to any branch for recycling. We partner with specialist recyclers to ensure zero cards end up in landfill.' },
  ]

  const goals = [
    { target: '2030', title: 'Net Zero Supply Chain', desc: 'We are working with all our suppliers to achieve a net-zero supply chain by 2030.' },
    { target: '2027', title: '\u00A3500M Green Lending', desc: 'Committed to lending \u00A3500 million to sustainable businesses and green energy projects by 2027.' },
    { target: '2026', title: 'EV Fleet Transition', desc: 'Converting our entire company vehicle fleet to electric vehicles by the end of 2026.' },
  ]

  return (
    <PageLayout
      title="Sustainability"
      subtitle="Building a bank that cares for people and the planet."
    >
      {/* Commitment */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Our Commitment</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">We believe that responsible banking means considering the long-term impact of every decision we make — on our customers, our communities, and our planet.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {initiatives.map((item, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-5">
                  <item.icon size={22} className="text-[#10B981]" />
                </div>
                <h3 className="font-display text-xl text-[#0A1628] mb-3">{item.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Our Goals</h2>
            <p className="text-[#64748B]">Ambitious targets for a sustainable future.</p>
          </div>
          <div className="space-y-4">
            {goals.map((g, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="px-6 py-3 bg-[#10B981]/10 rounded-xl text-center flex-shrink-0">
                  <p className="text-xs text-[#10B981] uppercase tracking-wider">Target</p>
                  <p className="font-display text-2xl text-[#10B981]">{g.target}</p>
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#0A1628] mb-1">{g.title}</h3>
                  <p className="text-sm text-[#64748B]">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
