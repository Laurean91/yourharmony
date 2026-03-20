import Link from 'next/link'
import { getSectionSettings, getTeacherProfile } from '../../actions'
import LandingEditor from '@/components/LandingEditor'

export default async function LandingSettingsPage() {
  const [hero, contacts, cta, features, formats, howItWorks, testimonials, faq, teacher] = await Promise.all([
    getSectionSettings('hero'),
    getSectionSettings('contacts'),
    getSectionSettings('cta'),
    getSectionSettings('features'),
    getSectionSettings('formats'),
    getSectionSettings('howItWorks'),
    getSectionSettings('testimonials'),
    getSectionSettings('faq'),
    getTeacherProfile(),
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/bigbos" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Панель управления
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">Управление сайтом</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-8 text-sm text-amber-800">
          Изменения сразу применяются на <a href="/" target="_blank" rel="noopener noreferrer" className="font-semibold underline">главной странице</a> после сохранения.
        </div>

        <LandingEditor
          hero={hero}
          contacts={contacts}
          cta={cta}
          features={features}
          formats={formats}
          howItWorks={howItWorks}
          testimonials={testimonials}
          faq={faq}
          teacher={teacher}
        />
      </div>
    </div>
  )
}
