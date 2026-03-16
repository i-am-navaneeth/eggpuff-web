'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'

const CAMPUS_BANNER_KEY = 'campusBannerDismissed'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showCampusNote, setShowCampusNote] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(CAMPUS_BANNER_KEY)
    if (!dismissed) setShowCampusNote(true)
  }, [])

  const dismissCampusBanner = () => {
    localStorage.setItem(CAMPUS_BANNER_KEY, 'true')
    setShowCampusNote(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">

      {/* ===================== CAMPUS BANNER ===================== 
      {showCampusNote && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            fontSize: 13,
            background: '#FFF3E0',
            color: '#111827',
            textAlign: 'center',
            borderBottom: '1px solid #FFE0B2',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>
              Available for{' '}
              <strong>Pydah College of Engineering, Patavala</strong> only.
            </span>

            {/* Beta pill 
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#F1D6A8',
                color: '#7A4E00',
                fontWeight: 600,
              }}
            >
              Beta
            </span>
          </div>

          <button
            onClick={dismissCampusBanner}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.5,
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>
      )}
*/}
      {/* ===================== TOP BAR ===================== */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f5] shadow-sm">
        <div className="max-w-[1140px] mx-auto px-6">
          <TopBar />
        </div>
      </div>

     {/* ===================== PAGE CONTENT ===================== */}
<div className="pt-[55px] px-0 sm:px-6 max-w-[1140px] mx-auto w-full">
  <main className="flex-1 py-4">
    {children}
  </main>
</div>

    </div>
  )
}