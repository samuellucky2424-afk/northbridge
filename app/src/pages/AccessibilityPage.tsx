import PageLayout from '../components/PageLayout'
import { Eye, Ear, Keyboard, Smartphone, HeartHandshake } from 'lucide-react'

export default function AccessibilityPage() {
  const features = [
    { icon: Eye, title: 'Visual Accessibility', items: ['Screen reader compatible (WCAG 2.1 AA)', 'High contrast mode', 'Adjustable font sizes', 'Compatible with VoiceOver and TalkBack'] },
    { icon: Ear, title: 'Hearing Accessibility', items: ['Visual indicators for all audio alerts', 'Transcripts for all video content', 'Chat-first customer support', 'British Sign Language video support'] },
    { icon: Keyboard, title: 'Motor Accessibility', items: ['Full keyboard navigation support', 'Skip to content links', 'Large, well-spaced tap targets', 'Switch control compatible'] },
    { icon: Smartphone, title: 'Cognitive Accessibility', items: ['Simple, clear language throughout', 'Consistent navigation patterns', 'Error prevention and recovery', 'Progress indicators for multi-step processes'] },
  ]

  return (
    <PageLayout
      title="Accessibility"
      subtitle="Banking should work for everyone. We are committed to making North Bridge Bank accessible to all."
    >
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-[#0A1628] mb-4">Our Accessibility Features</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">We design and build our products with accessibility at the core. Our commitment to WCAG 2.1 AA standards ensures that everyone can bank independently and confidently.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#D31111]/10 flex items-center justify-center mb-5">
                  <f.icon size={22} className="text-[#D31111]" />
                </div>
                <h3 className="font-display text-xl text-[#0A1628] mb-4">{f.title}</h3>
                <ul className="space-y-3">
                  {f.items.map((item, j) => (
                    <li key={j} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D31111] mt-2 flex-shrink-0" />
                      <span className="text-sm text-[#64748B]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HeartHandshake size={48} className="text-[#D31111] mx-auto mb-6" />
          <h2 className="font-display text-3xl text-[#0A1628] mb-4">We are always improving</h2>
          <p className="text-[#64748B] mb-6">If you encounter any accessibility barriers while using North Bridge Bank, we want to hear from you. Your feedback helps us build a better bank for everyone.</p>
          <p className="text-[#0A1628] font-medium">accessibility@northbridgebank.co.uk</p>
        </div>
      </section>
    </PageLayout>
  )
}
