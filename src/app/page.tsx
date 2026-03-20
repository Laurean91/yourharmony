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
        <LandingHero data={hero} />
        <BlogPreview />
        <LandingTop features={features} formats={formats} />
        <TeacherSection />
        <HowItWorksSection data={howItWorks} />
        <TestimonialsSection data={testimonials} />
        <CtaSection data={cta} />
        <FAQSection data={faq} />
        <LandingContacts data={contacts} />
      </main>
      <Footer />
    </div>
  )
}
