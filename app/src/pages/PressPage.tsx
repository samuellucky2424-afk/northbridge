import PageLayout from '../components/PageLayout'
import { ArrowRight, Calendar, Download } from 'lucide-react'

export default function PressPage() {
  const pressReleases = [
    { date: '20 June 2025', title: 'North Bridge Bank Surpasses \u00A310 Billion in Assets Under Management', category: 'Company News', excerpt: 'North Bridge Bank has reached a significant milestone, crossing \u00A310 billion in assets under management for the first time in the company\'s history.' },
    { date: '5 June 2025', title: 'North Bridge Bank Launches New Wealth Management Platform', category: 'Product Launch', excerpt: 'Our new bespoke wealth management platform offers curated investment portfolios managed by our City-based advisory team.' },
    { date: '18 May 2025', title: 'North Bridge Bank Named Best Digital Bank 2025', category: 'Awards', excerpt: 'North Bridge Bank has been recognised as the Best Digital Bank at the 2025 British Banking Awards, marking our third consecutive win.' },
    { date: '2 May 2025', title: 'North Bridge Bank Expands to 30 UK Locations', category: 'Company News', excerpt: 'We are opening six new branches across the UK, bringing our total to 30 locations and making in-person banking accessible to more communities.' },
    { date: '10 April 2025', title: 'Partnership Announcement: North Bridge Bank and MoneyHelper', category: 'Partnership', excerpt: 'North Bridge Bank partners with MoneyHelper to provide free financial guidance to all North Bridge Bank customers.' },
  ]

  const mediaKit = [
    { label: 'Brand Guidelines (PDF)', size: '2.4 MB' },
    { label: 'Logo Pack (ZIP)', size: '8.1 MB' },
    { label: 'Press Photos (ZIP)', size: '24.6 MB' },
    { label: 'Company Fact Sheet (PDF)', size: '1.2 MB' },
  ]

  return (
    <PageLayout
      title="Press Centre"
      subtitle="Latest news, press releases, and media resources from North Bridge Bank."
    >
      {/* Press Releases */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Latest News</h2>
          </div>
          <div className="space-y-6">
            {pressReleases.map((pr, i) => (
              <article key={i} className="bg-[#F8FAFC] rounded-2xl p-8 hover:shadow-soft transition-all cursor-pointer group">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="flex items-center space-x-1 text-xs text-[#64748B]">
                    <Calendar size={14} /><span>{pr.date}</span>
                  </span>
                  <span className="px-2.5 py-1 bg-[#FEE2E2] text-[#D31111] text-xs font-medium rounded-md">{pr.category}</span>
                </div>
                <h3 className="font-display text-xl text-[#0A1628] group-hover:text-[#D31111] transition-colors mb-2">{pr.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">{pr.excerpt}</p>
                <span className="inline-flex items-center text-sm font-medium text-[#D31111]">
                  Read more <ArrowRight size={16} className="ml-1" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Media Kit</h2>
            <p className="text-[#64748B]">Download official North Bridge Bank brand assets and resources.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mediaKit.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-soft transition-all cursor-pointer group">
                <Download size={24} className="text-[#D31111] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-[#0A1628] mb-1">{item.label}</p>
                <p className="text-xs text-[#64748B]">{item.size}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">Press Enquiries</h2>
          <p className="text-[#64748B] mb-6">For press enquiries, interview requests, or additional information, please contact our communications team.</p>
          <p className="text-lg text-[#0A1628] font-medium">press@northbridgebank.co.uk</p>
        </div>
      </section>
    </PageLayout>
  )
}
