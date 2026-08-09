'use client'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import UserProvider from '../components/UserProvider'
import { NotificationProvider } from '../components/NotificationProvider'
import {
  useEffect,
  useState,
} from 'react'

import PWARegister from '@/components/PWARegister'
import PWAInstall from '@/components/PWAInstall'
import AuthProvider from '@/components/AuthProvider'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
const pathname = usePathname()
const router = useRouter()

const [readerTransition, setReaderTransition] =
  useState<{
    title: string
    resourceId: string
  } | null>(null)

useEffect(() => {
  const handler = (e: Event) => {
    const detail =
      (e as CustomEvent).detail

    if (
      !detail?.resourceId ||
      !detail?.title
    ) {
      return
    }

    setReaderTransition({
      title: detail.title,
      resourceId: detail.resourceId,
    })

    window.setTimeout(() => {
      router.push(
        `/reader/${detail.resourceId}`
      )
    }, 320)
  }

  window.addEventListener(
    'ep-open-reader',
    handler
  )

  return () => {
    window.removeEventListener(
      'ep-open-reader',
      handler
    )
  }
}, [router])

useEffect(() => {
  if (pathname.startsWith('/reader/')) {
    setReaderTransition(null)
  }
}, [pathname])

const isPublicPage =
  pathname === '/' ||
  pathname.startsWith('/login') ||
  pathname.startsWith('/resource/') ||
  pathname.startsWith('/reader/')

return (
  <NotificationProvider>
    <AuthProvider>
      <UserProvider>
        {/* ================= READER TRANSITION ================= */}

        {readerTransition && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,

              background: '#FFFFFF',

              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',

              padding: 24,

              animation:
                'readerTransitionIn 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* BOOK ICON */}

            <div
              style={{
                width: 76,
                height: 96,

                borderRadius:
                  '8px 12px 12px 8px',

                background: '#111827',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                boxShadow:
                  '0 14px 35px rgba(15, 23, 42, 0.16)',

                animation:
                  'readerBookOpen 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <div
                style={{
                  width: 2,
                  height: '72%',
                  background:
                    'rgba(255,255,255,0.25)',
                }}
              />
            </div>

            {/* TITLE */}

            <div
              style={{
                marginTop: 26,

                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.4,

                textAlign: 'center',
                color: '#111827',

                maxWidth: 520,
              }}
            >
              {readerTransition.title}
            </div>

            {/* STATUS */}

            <div
              style={{
                marginTop: 10,

                color: '#6B7280',
                fontSize: 14,
              }}
            >
              Opening Reader...
            </div>

            <style jsx>{`
              @keyframes readerTransitionIn {
                0% {
                  opacity: 0;
                  transform: scale(0.96);
                }

                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes readerBookOpen {
                0% {
                  opacity: 0;
                  transform:
                    perspective(600px)
                    rotateY(-18deg)
                    scale(0.92);
                }

                100% {
                  opacity: 1;
                  transform:
                    perspective(600px)
                    rotateY(0deg)
                    scale(1);
                }
              }
            `}</style>
          </div>
        )}

        {/* ================= APP SHELL ================= */}

        {/* PWA Setup */}

        <PWARegister />
        <PWAInstall />

        {/* App Content */}

        {children}
      </UserProvider>
    </AuthProvider>
  </NotificationProvider>
)
}