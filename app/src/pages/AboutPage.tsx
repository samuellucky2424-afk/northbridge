import PageLayout from '../components/PageLayout'
import { Target, Eye, Heart } from 'lucide-react'

export default function AboutPage() {
  const values = [
    { icon: Target, title: 'Our Mission', desc: 'To make banking fair, transparent, and accessible for every person and business in the United Kingdom.' },
    { icon: Eye, title: 'Our Vision', desc: 'A world where financial services empower people to live better lives, not complicate them.' },
    { icon: Heart, title: 'Our Values', desc: 'Integrity, transparency, and customer obsession guide every decision we make at North Bridge Bank.' },
  ]

  const stats = [
    { value: '142K+', label: 'Customers' },
    { value: '\u00A39.7B', label: 'Assets Managed' },
    { value: '24', label: 'UK Branches' },
    { value: '850+', label: 'Team Members' },
  ]

  return (
    <PageLayout
      title="About North Bridge Bank"
      subtitle="We are building the bank that Britain deserves — modern, fair, and designed around you."
    >
      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl text-[#0A1628] mb-6">Our Story</h2>
              <div className="space-y-4 text-[#64748B] leading-relaxed">
                <p>Founded in 2018, North Bridge Bank emerged from a simple belief: banking should work for people, not against them. In a world of hidden fees, endless queues, and outdated technology, we set out to build something different.</p>
                <p>Starting with a small team in London, we have grown to serve over 142,000 customers across the UK. From students managing their first accounts to businesses processing millions in transactions, North Bridge Bank has become the financial partner people trust.</p>
                <p>We are authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority. Your deposits are protected up to &pound;85,000 by the FSCS.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8 text-center">
                  <p className="font-display text-3xl text-[#D31111] mb-1">{s.value}</p>
                  <p className="text-sm text-[#64748B]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">What We Stand For</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Our values are not just words on a wall — they guide every product we build and every interaction we have.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-5">
                  <v.icon size={22} className="text-[#D31111]" />
                </div>
                <h3 className="font-display text-xl text-[#0A1628] mb-3">{v.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Leadership Team</h2>
            <p className="text-[#64748B]">Meet the people guiding North Bridge Bank forward.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Alexander Reeves', role: 'Chief Executive Officer', initial: 'AR' },
              { name: 'Victoria Chen', role: 'Chief Technology Officer', initial: 'VC' },
              { name: 'Daniel Okafor', role: 'Chief Financial Officer', initial: 'DO' },
              { name: 'Margaret Holmes', role: 'Chief Risk Officer', initial: 'MH' },
            ].map((person, i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-medium">{person.initial}</span>
                </div>
                <h3 className="font-display text-lg text-[#0A1628]">{person.name}</h3>
                <p className="text-sm text-[#64748B]">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
