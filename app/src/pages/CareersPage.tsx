import PageLayout from '../components/PageLayout'
import { MapPin, Clock, ArrowRight } from 'lucide-react'

export default function CareersPage() {
  const departments = ['Engineering', 'Product', 'Design', 'Risk & Compliance', 'Customer Success', 'Marketing']

  const roles = [
    { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'London', type: 'Full-time', salary: '\u00A375,000 - \u00A395,000' },
    { title: 'Product Manager — Payments', dept: 'Product', location: 'London', type: 'Full-time', salary: '\u00A365,000 - \u00A385,000' },
    { title: 'UX Designer', dept: 'Design', location: 'Remote', type: 'Full-time', salary: '\u00A350,000 - \u00A370,000' },
    { title: 'Risk Analyst', dept: 'Risk & Compliance', location: 'London', type: 'Full-time', salary: '\u00A345,000 - \u00A360,000' },
    { title: 'Customer Success Manager', dept: 'Customer Success', location: 'Manchester', type: 'Full-time', salary: '\u00A335,000 - \u00A345,000' },
    { title: 'Marketing Lead', dept: 'Marketing', location: 'London', type: 'Full-time', salary: '\u00A355,000 - \u00A375,000' },
  ]

  const benefits = [
    'Competitive salary and annual bonus',
    '33 days holiday including bank holidays',
    'Private health insurance (Bupa)',
    'Pension scheme with 8% employer contribution',
    'Flexible working — hybrid or remote',
    '\u00A31,000 annual learning budget',
    'Free North Bridge Bank premium account',
    'Monthly team events and quarterly offsites',
  ]

  return (
    <PageLayout
      title="Careers at North Bridge Bank"
      subtitle="Join 850+ people building the future of British banking."
    >
      {/* Culture */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Why work here?</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">We believe the best work happens when people are empowered, supported, and given the freedom to innovate.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.slice(0, 4).map((b, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-6 flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-[#D31111] mt-2 flex-shrink-0" />
                <p className="text-sm text-[#0A1628]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Open Positions</h2>
            <p className="text-[#64748B]">{roles.length} roles available across {departments.length} departments</p>
          </div>

          {/* Department filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['All', ...departments].map((d) => (
              <button key={d} className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-light text-[#64748B] hover:border-[#D31111] hover:text-[#D31111] transition-all">
                {d}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {roles.map((role, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-soft transition-all cursor-pointer group">
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-display text-lg text-[#0A1628] group-hover:text-[#D31111] transition-colors">{role.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#64748B]">
                    <span className="flex items-center space-x-1"><MapPin size={14} /><span>{role.location}</span></span>
                    <span className="flex items-center space-x-1"><Clock size={14} /><span>{role.type}</span></span>
                    <span className="px-2 py-0.5 bg-[#F1F5F9] rounded-md text-xs">{role.dept}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-[#0A1628]">{role.salary}</span>
                  <ArrowRight size={18} className="text-[#64748B] group-hover:text-[#D31111] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
