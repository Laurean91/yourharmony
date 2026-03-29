import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTeacherProfile, getTeacherPageContent } from '../actions'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BookingButton from '../../components/BookingButton'

export const revalidate = 300

import { SITE_URL } from '../../lib/config'

export async function generateMetadata(): Promise<Metadata> {
  const teacher = await getTeacherProfile()
  const title = `Преподаватель — ${teacher.name} | Клуб «Гармония»`
  const description = teacher.bio ?? 'Преподаватель детского языкового клуба «Гармония». Сертификат CELTA (Cambridge), IELTS 8.0, опыт 7+ лет. Английский для детей от 4 до 14 лет в Москве у метро Люблино.'
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/teacher` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/teacher`,
      siteName: 'Клуб «Гармония»',
      type: 'profile',
      images: [{ url: teacher.photoUrl ?? `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  }
}

export default async function TeacherPage() {
  const [teacher, pageContent] = await Promise.all([getTeacherProfile(), getTeacherPageContent()])
  const { credentials, approach, showCredentials, showApproach } = pageContent
  const badges = teacher.badges ? teacher.badges.split(',').map((b: string) => b.trim()).filter(Boolean) : []

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#teacher`,
    name: teacher.name,
    jobTitle: 'Преподаватель английского языка',
    description: teacher.bio,
    url: `${SITE_URL}/teacher`,
    ...(teacher.photoUrl && { image: teacher.photoUrl }),
    worksFor: { '@id': `${SITE_URL}/#organization` },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Certificate',
      name: 'CELTA',
      recognizedBy: { '@type': 'Organization', name: 'Cambridge University Press & Assessment' },
    },
    knowsLanguage: ['ru', 'en'],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Преподаватель', item: `${SITE_URL}/teacher` },
    ],
  }

  const schemasJson = JSON.stringify(personSchema)
  const breadcrumbJson = JSON.stringify(breadcrumbSchema)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemasJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJson }} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute top-[-8rem] left-[-8rem] w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute top-[-8rem] right-[-8rem] w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors mb-8"
          >
            ← На главную
          </Link>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-shrink-0">
              {teacher.photoUrl ? (
                <Image
                  src={teacher.photoUrl}
                  alt={teacher.name}
                  width={180}
                  height={180}
                  className="w-44 h-44 rounded-full object-cover shadow-lg"
                  priority
                />
              ) : (
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center shadow-lg">
                  <span className="text-5xl font-extrabold text-white">
                    {teacher.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-1">Преподаватель клуба</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{teacher.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{teacher.bio}</p>
              {badges.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {badges.map((badge: string) => (
                    <span
                      key={badge}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      {showCredentials && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">
              Образование и квалификация
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {credentials.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Подход */}
      {showApproach && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">
              Подход к обучению
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {approach.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Нижняя навигация */}
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl font-semibold text-purple-600 hover:bg-white/80 transition-all shadow-sm text-sm"
        >
          ← На главную
        </Link>
        <BookingButton className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-2xl font-semibold hover:brightness-110 transition-all shadow-md text-sm">
          Записаться на занятие →
        </BookingButton>
      </div>

      <Footer />
    </div>
  )
}
