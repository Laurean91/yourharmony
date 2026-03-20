import { LandingHero, LandingTop, LandingContacts, HowItWorksSection, TestimonialsSection, CtaSection, FAQSection } from '../components/LandingClient'
import BlogPreview from '../components/BlogPreview'
import TeacherSection from '../components/TeacherSection'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getSectionSettings } from './actions'

export default async function HomePage() {
  const [hero, features, formats, contacts, howItWorks, testimonials, cta, faq] = await Promise.all([
    getSectionSettings('hero'),
    getSectionSettings('features'),
    getSectionSettings('formats'),
    getSectionSettings('contacts'),
    getSectionSettings('howItWorks'),
    getSectionSettings('testimonials'),
    getSectionSettings('cta'),
    getSectionSettings('faq'),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <Navbar />
      <main>
        {hero.enabled !== false && <LandingHero data={hero} />}
        <BlogPreview />
        {(features.enabled !== false || formats.enabled !== false) && (
          <LandingTop features={features} formats={formats} />
        )}
        <TeacherSection />
        {howItWorks.enabled !== false && <HowItWorksSection data={howItWorks} />}
        {testimonials.enabled !== false && <TestimonialsSection data={testimonials} />}
        {cta.enabled !== false && <CtaSection data={cta} />}
        {faq.enabled !== false && <FAQSection data={faq} />}
        {contacts.enabled !== false && <LandingContacts data={contacts} />}
      </main>
      <Footer />
    </div>
  )
}
