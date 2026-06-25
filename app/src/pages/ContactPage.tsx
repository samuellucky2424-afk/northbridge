import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const contactMethods = [
    { icon: Phone, label: 'Phone', value: '0800 123 4567', note: 'Available 24/7' },
    { icon: Mail, label: 'Email', value: 'support@northbridgebank.co.uk', note: 'Response within 4 hours' },
    { icon: MapPin, label: 'Head Office', value: '1 Crown Place, London, EC2A 4NE', note: 'Mon-Fri, 9am-5pm' },
    { icon: Clock, label: 'Branch Hours', value: 'Mon-Fri: 9am-5pm, Sat: 9am-1pm', note: 'Find your nearest branch' },
  ]

  return (
    <PageLayout
      title="Contact Us"
      subtitle="We are here to help. Reach out through any of the channels below."
    >
      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((m, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                  <m.icon size={22} className="text-[#D31111]" />
                </div>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-sm font-medium text-[#0A1628] mb-1">{m.value}</p>
                <p className="text-xs text-[#64748B]">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl text-[#0A1628] mb-2">Send us a message</h2>
                  <p className="text-sm text-[#64748B]">Fill in the form below and we will get back to you as soon as possible.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0A1628] mb-2">Full name</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0A1628] mb-2">Email</label>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">Subject</label>
                    <select required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]">
                      <option value="">Select a subject</option>
                      <option>Account Support</option>
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Complaint</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] resize-none"
                      placeholder="How can we help?" />
                  </div>
                  <button type="submit" className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2">
                    <Send size={18} /><span>Send message</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-[#10B981]" />
                </div>
                <h3 className="font-display text-2xl text-[#0A1628] mb-2">Message sent</h3>
                <p className="text-[#64748B]">Thank you for contacting us. We will respond within 4 hours.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
