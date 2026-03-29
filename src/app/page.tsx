import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { LandingHero, LandingTop } from '../components/LandingClient'
import BlogPreview from '../components/BlogPreview'
import TeacherSection from '../components/TeacherSection'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getSectionSettings, getTeacherProfile } from './actions'
import { SITE_URL } from '../lib/config'

export const revalidate = 3600

const HowItWorksSection = dynamic(() => import('../components/LandingClient').then(m => ({ default: m.HowItWorksSection })))
const TestimonialsSection = dynamic(() => import('../components/LandingClient').then(m => ({ default: m.TestimonialsSection })))
const CtaSection = dynamic(() => import('../components/LandingClient').then(m => ({ default: m.CtaSection })))
const FAQSection = dynamic(() => import('../components/LandingClient').then(m => ({ default: m.FAQSection })))
const LandingContacts = dynamic(() => import('../components/LandingClient').then(m => ({ default: m.LandingContacts })))

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

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Английский язык для детей от 4 лет',
    description: 'Групповые офлайн-занятия по субботам и онлайн-занятия по согласованию для детей от 4 лет в Москве (м. Люблино)',
    url: `${SITE_URL}/`,
    provider: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/#booking`,
    },
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'https://schema.org/OfflineCourse',
        location: {
          '@type': 'Place',
          name: 'Языковой клуб «Гармония»',
          address: 'Армавирская ул., 1/20, Москва',
        },
        courseSchedule: {
          '@type': 'Schedule',
          repeatFrequency: 'P1W',
          byDay: ['Saturday'],
          startTime: '12:00',
        },
        instructor: { '@id': `${SITE_URL}/#teacher` },
      },
      {
        '@type': 'CourseInstance',
        courseMode: 'https://schema.org/OnlineCourse',
        description: 'Онлайн-занятия по согласованию с преподавателем',
        instructor: { '@id': `${SITE_URL}/#teacher` },
      },
    ],
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#teacher`,
    name: teacher.name,
    description: teacher.bio,
    ...(teacher.photoUrl && { image: teacher.photoUrl }),
    jobTitle: 'Преподаватель английского языка',
    worksFor: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}/teacher`,
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Certificate',
      name: 'CELTA',
      recognizedBy: { '@type': 'Organization', name: 'Cambridge University Press & Assessment' },
    },
    knowsLanguage: ['ru', 'en'],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <Navbar />
      <main>
        {hero.enabled !== false && <LandingHero data={hero} />}
        <Suspense fallback={null}>
          <BlogPreview />
        </Suspense>
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
            {faq.items?.length > 0 && (
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
            )}
          </>
        )}
        {contacts.enabled !== false && <LandingContacts data={contacts} />}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Как записать ребёнка в языковой клуб «Гармония»',
        description: 'Три шага для начала занятий английским языком в клубе «Гармония»',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Оставьте заявку', text: 'Нажмите кнопку «Записаться на пробное занятие» на сайте или напишите в Telegram. Первое занятие — бесплатно.' },
          { '@type': 'HowToStep', position: 2, name: 'Познакомьтесь с клубом', text: 'Приходите на пробное занятие. Преподаватель познакомится с ребёнком, оценит уровень и проведёт полноценный урок.' },
          { '@type': 'HowToStep', position: 3, name: 'Начинайте учиться', text: 'После пробного занятия вы получите обратную связь и рекомендацию по группе. Оформите абонемент и начинайте регулярные занятия.' },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: 'Английский для детей в Москве | Клуб «Гармония»',
        description: 'Детский языковой клуб «Гармония» — английский для детей от 4 лет в Москве у метро Люблино.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 },
        inLanguage: 'ru-RU',
      }) }} />
      <Footer />
    </div>
  )
}
