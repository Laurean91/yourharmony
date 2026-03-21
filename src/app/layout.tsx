import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["800"],
});

const SITE_URL = 'https://yourharmony.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'Клуб «Гармония» | Английский для детей',
    template: '%s | Клуб «Гармония»',
  },
  description: 'Детский языковой клуб «Гармония» — английский для детей от 6 лет. Учим язык играючи, свободно и в радость!',
  alternates: { canonical: SITE_URL },
  openGraph: {
    siteName: 'Клуб «Гармония»',
    locale: 'ru_RU',
    type: 'website',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: 'Клуб «Гармония»' }],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'EducationalOrganization'],
  '@id': `${SITE_URL}/#organization`,
  name: 'Языковой клуб «Гармония»',
  alternateName: 'Клуб Гармония',
  description: 'Детский языковой клуб «Гармония» — английский для детей от 6 до 14 лет. Групповые офлайн-занятия и индивидуальные онлайн-занятия.',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
  image: `${SITE_URL}/logo.png`,
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
  sameAs: ['https://t.me/harmonyEnglish'],
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
          description: 'До 8 детей в группе. Офлайн-занятия 2 раза в неделю для детей от 6 лет.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Индивидуальные онлайн-занятия',
          description: 'Персональный урок онлайн. Программа под конкретного ребёнка, гибкий график.',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '40',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Клуб «Гармония»',
  description: 'Детский языковой клуб — английский для детей от 6 лет',
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
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
