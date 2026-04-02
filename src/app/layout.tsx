import type { Metadata } from "next";
import { Geist, Nunito } from "next/font/google";
import "./globals.css";
import { SITE_URL } from '../lib/config'
import { ToastProvider } from '@/components/ui/toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["800"],
});

export const metadata: Metadata = {
  title: {
    default: 'Английский для детей в Москве | Клуб «Гармония»',
    template: '%s | Клуб «Гармония»',
  },
  description: 'Английский для детей от 4 лет в Москве у метро Люблино. Групповые занятия по субботам в 12:00. Онлайн по согласованию. Группы до 8 детей, педагог с CELTA и IELTS 8.0.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Английский для детей в Москве | Клуб «Гармония»',
    description: 'Английский для детей от 4 лет в Москве у метро Люблино. Групповые занятия по субботам в 12:00. Онлайн по согласованию. Группы до 8 детей, педагог с CELTA и IELTS 8.0.',
    siteName: 'Клуб «Гармония»',
    locale: 'ru_RU',
    type: 'website',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Клуб «Гармония»' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Английский для детей в Москве | Клуб «Гармония»',
    description: 'Английский для детей от 4 лет в Москве у метро Люблино. Групповые занятия по субботам в 12:00. Онлайн по согласованию. Группы до 8 детей, педагог с CELTA и IELTS 8.0.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'EducationalOrganization'],
  '@id': `${SITE_URL}/#organization`,
  name: 'Языковой клуб «Гармония»',
  alternateName: 'Клуб Гармония',
  description: 'Детский языковой клуб «Гармония» — английский для детей от 4 лет в Москве. Групповые занятия по субботам у метро Люблино, онлайн-занятия по согласованию.',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 1536, height: 1024 },
  image: `${SITE_URL}/og-image.png`,
  telephone: '+7 (985) 150-83-00',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Армавирская ул., 1/20',
    addressLocality: 'Москва',
    addressRegion: 'Москва',
    postalCode: '109341',
    addressCountry: 'RU',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 55.6777, longitude: 37.7632 },
  foundingDate: '2023',
  sameAs: ['https://t.me/harmonyEnglish'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '12:00',
      closes: '18:00',
    },
  ],
  priceRange: '₽₽',
  currenciesAccepted: 'RUB',
  areaServed: { '@type': 'City', name: 'Москва' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Программы обучения английскому языку',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Групповые занятия английским',
          description: 'До 8 детей в группе. Офлайн-занятия по субботам в 12:00 у метро Люблино, для детей от 4 лет.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Онлайн-занятия',
          description: 'Персональный урок онлайн. Программа под конкретного ребёнка, время по согласованию с преподавателем.',
        },
      },
    ],
  },
  email: 'info@yourharmony-english.ru',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    bestRating: '5',
    worstRating: '1',
    reviewCount: 6,
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Мария К.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Первые два месяца Саша капризничал — не хотел идти. Потом что-то переключилось, и теперь сам напоминает, что сегодня английский. Словарный запас заметно вырос.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Дмитрий Л.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Честно, ждал прогресса побыстрее. Но потом понял — дочь просто не замечает, что учится. Говорит фразы из мультиков, сама того не осознавая.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Елена В.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Сын — интроверт, в больших группах терялся. Здесь детей мало, он освоился за пару недель. В мае сдавал Starters — прошёл.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Ольга П.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'До этого пробовали онлайн-платформу — бросила через месяц. Тут другое: живой человек, живая реакция. Вика иногда всё равно ленится, но с занятий не пропускает.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Андрей Н.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Перешли из крупной школы — там было 15 человек в группе, Никита просто сидел тихо. Здесь приходится говорить, никуда не спрячешься. Результат почувствовался месяца через три.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Светлана М.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Пришли попробовать — особо не рассчитывали. Даша после первого занятия сказала «мам, там весело». Пока занимаемся, смотрим что будет дальше.',
    },
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Клуб «Гармония»',
  description: 'Детский языковой клуб — английский для детей от 4 лет в Москве',
  inLanguage: 'ru-RU',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="dns-prefetch" href="https://c27qjcTvvwmmVqah.public.blob.vercel-storage.com" />
        <link rel="preconnect" href="https://c27qjcTvvwmmVqah.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${nunito.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
