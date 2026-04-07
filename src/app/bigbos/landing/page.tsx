import Link from 'next/link'
import { getSectionSettings, getTeacherProfile, getPhotos } from '../../actions'
import LandingEditor from '@/components/LandingEditor'

export const dynamic = 'force-dynamic'

export default async function LandingSettingsPage() {
  const [hero, contacts, cta, features, formats, howItWorks, testimonials, faq, teacher, photos] = await Promise.all([
    getSectionSettings('hero'),
    getSectionSettings('contacts'),
    getSectionSettings('cta'),
    getSectionSettings('features'),
    getSectionSettings('formats'),
    getSectionSettings('howItWorks'),
    getSectionSettings('testimonials'),
    getSectionSettings('faq'),
    getTeacherProfile(),
    getPhotos(),
  ])

  return (
    <div className="p-8 font-sans" style={{ color: 'var(--adm-text-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--adm-text-primary)' }}>Управление сайтом</h1>
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
          photos={photos}
        />
      </div>
    </div>
  )
}
