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

export const metadata: Metadata = {
  title: {
    default: 'Клуб «Гармония» | Английский для детей',
    template: '%s | Клуб «Гармония»',
  },
  description: 'Детский языковой клуб «Гармония» — английский для детей от 6 лет. Учим язык играючи, свободно и в радость!',
  openGraph: {
    siteName: 'Клуб «Гармония»',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
