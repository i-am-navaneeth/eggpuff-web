import './globals.css'

import type { Metadata, Viewport } from 'next'

import ClientWrapper from '@/components/ClientWrapper' // ✅ NEW

/* ========================================
   Metadata
======================================== */
export const metadata: Metadata = {
  title: 'EggPuff — Your Campus, One Place',
  description:
    'EggPuff is a campus-based platform where students ask questions, connect, and grow within their college community.',
  keywords: [
    'college app',
    'student community',
    'campus network',
    'college questions',
    'student platform',
  ],
  icons: {
    icon: '/eggpuff.favicon.png',
  },
  manifest: '/manifest.json',

  /* 🔥 OPEN GRAPH (WHATSAPP / LINK PREVIEW) */
  openGraph: {
    title: 'EggPuff — Your Campus, One Place',
    description:
      'Ask questions, connect with students, and grow together — all within your own college.',
    url: 'https://eggpuff.in',
    siteName: 'EggPuff',
    images: [
      {
        url: 'https://eggpuff.in/og.png', // ✅ MUST be absolute
        width: 1200,
        height: 630,
        alt: 'EggPuff - Your Campus, One Place',
      },
    ],
    type: 'website',
  },

  /* 🔥 TWITTER (ALSO USED BY SOME APPS) */
  twitter: {
    card: 'summary_large_image',
    title: 'EggPuff — Your Campus, One Place',
    description:
      'Ask questions, connect with students, and grow together within your college.',
    images: ['https://eggpuff.in/og.png'],
  },

  /* 🔥 GOOGLE VERIFICATION */
  verification: {
    google: '1sGCbWbrj8S_brZa2g6_ewVDyOCXXbnmcoBX6lKfvYg', // 🔁 replace this
  },
}

/* ========================================
   Viewport
======================================== */
export const viewport: Viewport = {
  themeColor: '#F4B860',
}

/* ========================================
   Root Layout (SERVER)
======================================== */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  )
}