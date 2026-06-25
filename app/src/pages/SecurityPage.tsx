import PageLayout from '../components/PageLayout'
import { Shield, Lock, Fingerprint, Bell, Eye, Server, FileCheck } from 'lucide-react'

export default function SecurityPage() {
  const layers = [
    { icon: Lock, title: 'Encryption', desc: 'All data is protected with 256-bit AES encryption — the same standard used by military and government organisations worldwide.' },
    { icon: Fingerprint, title: 'Biometric Authentication', desc: 'Log in securely with Face ID, Touch ID, or fingerprint recognition. No passwords to remember, no codes to type.' },
    { icon: Bell, title: 'Real-Time Alerts', desc: 'Receive instant notifications for every login, transaction, and account change. If you did not do it, you will know immediately.' },
    { icon: Eye, title: 'Fraud Monitoring', desc: 'Our AI-powered systems monitor transactions 24/7, detecting and blocking suspicious activity before it affects your account.' },
    { icon: Server, title: 'Secure Infrastructure', desc: 'Our servers are hosted in UK-based ISO 27001 certified data centres with redundant systems and automatic failover.' },
    { icon: FileCheck, title: 'Regulatory Compliance', desc: 'We are fully FCA regulated and PRA authorised. All operations comply with GDPR, PCI DSS, and UK banking regulations.' },
  ]

  const tips = [
    'Never share your PIN or password with anyone',
    'Enable biometric login for the most secure access',
    'Regularly review your transaction history',
    'Keep your app updated to the latest version',
    'Use a unique, strong password for your North Bridge Bank account',
    'Contact us immediately if you notice suspicious activity',
  ]

  return (
    <PageLayout
      title="Security Centre"
      subtitle="Your security is our highest priority. Learn how we protect you and your money."
    >
      {/* Protection Layers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">How We Protect You</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">Multiple layers of security work together to keep your account and personal information safe at all times.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {layers.map((l, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-5">
                  <l.icon size={22} className="text-[#D31111]" />
                </div>
                <h3 className="font-display text-xl text-[#0A1628] mb-3">{l.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Certifications & Compliance</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { cert: 'FCA Authorised', desc: 'Financial Conduct Authority' },
              { cert: 'PRA Regulated', desc: 'Prudential Regulation Authority' },
              { cert: 'PCI DSS Level 1', desc: 'Payment Card Industry' },
              { cert: 'ISO 27001', desc: 'Information Security' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center">
                <Shield size={32} className="text-[#D31111] mx-auto mb-3" />
                <h3 className="font-display text-lg text-[#0A1628] mb-1">{c.cert}</h3>
                <p className="text-sm text-[#64748B]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Security Tips</h2>
            <p className="text-[#64748B]">Simple steps to keep your account even more secure.</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-8">
            <ul className="space-y-4">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#D31111]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-[#D31111]">{i + 1}</span>
                  </div>
                  <span className="text-sm text-[#0A1628]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
