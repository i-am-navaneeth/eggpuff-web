'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  // 🔥 you already use this somewhere, keeping it
  const avatar = null // replace with your actual state if needed
  const username = 'Username' // replace with dynamic later

  const navItems = [
    { label: 'Home', icon: '🏠', path: '/feed' },
    { label: 'Search', icon: '🔍', path: '/search' },
    { label: 'Notifications', icon: '🔔', path: '/notifications' },
  ]

  return (
    <div
      style={{
        width: 80,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        gap: 18,
        justifyContent: 'space-between',
      }}
    >
      {/* 🔝 TOP SECTION */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 10,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/feed')}
        >
          🥚
        </div>

        {/* NAV ITEMS */}
        {navItems.map((item) => {
          const active = pathname === item.path

          return (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 22,
                transition: 'all 0.2s ease',

                background: active ? '#111' : 'transparent',
                color: active ? '#fff' : '#111',
              }}
            >
              {item.icon}
            </div>
          )
        })}
      </div>

      {/* 🔻 PROFILE SECTION (YOUR CODE, FIXED POSITION) */}
      <div
        onClick={() => router.push('/profile')}
        style={{
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          gap: 6,
        }}
      >
        {/* AVATAR */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
              }}
            />
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F4B860"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4.2" />
              <path d="M4 20c2.5-4.5 6.5-6.5 8-6.5s5.5 2 8 6.5" />
            </svg>
          )}
        </div>

        {/* 🔥 USERNAME (NEW) */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#374151',
            textAlign: 'center',
            maxWidth: 70,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {username}
        </div>
      </div>
    </div>
  )
}