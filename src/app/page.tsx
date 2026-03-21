import { LandingHero, LandingTop, LandingContacts, HowItWorksSection, TestimonialsSection, CtaSection, FAQSection } from '../components/LandingClient'
import BlogPreview from '../components/BlogPreview'
import TeacherSection from '../components/TeacherSection'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getSectionSettings, getTeacherProfile } from './actions'

const SITE_URL = 'https://yourharmony.vercel.app'

export default async function HomePage() {
  const [hero, features, formats, contacts, howItWorks, testimonials, cta, faq, teacher] = await Promise.all([
    getSectionSettings('hero'),
    getSectionSettings('features'),
    getSectionSettings('formats'),
    getSectionSettings('contacts'),
    getSectionSettings('howItWorks'),
    getSectionSettings('testimonials'),
    getSectionSettings('cta'),
    getSectionSettings('faq'),
    getTeacherProfile(),
  ])

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#teacher`,
    name: teacher.name,
    description: teacher.bio,
    ...(teacher.photoUrl && { image: teacher.photoUrl }),
    jobTitle: 'Преподаватель английского языка',
    worksFor: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}/#teacher`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <Navbar />
      <main>
        {hero.enabled !== false && <LandingHero data={hero} />}
        <BlogPreview />
        {(features.enabled !== false || formats.enabled !== false) && (
          <LandingTop features={features} formats={formats} />
        )}
        <TeacherSection
          name={teacher.name}
          bio={teacher.bio}
          photoUrl={teacher.photoUrl}
          badges={teacher.badges.split(',').map(b => b.trim()).filter(Boolean)}
        />
        {howItWorks.enabled !== false && <HowItWorksSection data={howItWorks} />}
        {testimonials.enabled !== false && <TestimonialsSection data={testimonials} />}
        {cta.enabled !== false && <CtaSection data={cta} />}
        {faq.enabled !== false && (
          <>
            <FAQSection data={faq} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faq.items.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                }),
              }}
            />
          </>
        )}
        {contacts.enabled !== false && <LandingContacts data={contacts} />}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Footer />
    </div>
  )
}
