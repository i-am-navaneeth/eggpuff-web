'use client'

import { useShellLayout } from '@/components/ShellLayoutContext'
import { useRouter, usePathname } from 'next/navigation'
import { BackButton } from '@/components/topbar/TopBarSlots'

type PublicTopBarProps = {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export default function PublicTopBar({
  title,
  showBack,
  onBack,
  rightSlot,
}: PublicTopBarProps) {
  const { topBar } = useShellLayout()
  const router = useRouter()
  const pathname = usePathname()

  const isReader =
    pathname.startsWith('/reader/')

  return (
    <div
      style={{
        height: 55,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,

        background: '#FFFFFF',

        borderBottom:
          '1px solid #EEEEEE',

        display: 'flex',
        alignItems: 'center',

        padding: '0 16px',
      }}
    >
      {/* LEFT + CENTER */}
<div
  style={{
    flex: 1,
    minWidth: 0,

    display: 'flex',
    alignItems: 'center',
  }}
>
  {/* BACK BUTTON */}
  <div
    style={{
      width: 32,
      flexShrink: 0,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',

      marginRight: 2,
    }}
  >
   {(showBack ?? topBar.showBack) || pathname === '/resources' ? (
  <BackButton
    onClick={
      onBack ??
      topBar.onBack ??
      (() => router.back())
    }
  />
) : (
  <div style={{ width: 32 }} />
)}
  </div>

  {/* TITLE */}
  <div
    style={{
      minWidth: 0,
      flex: 1,

      fontSize: 20,
      fontWeight: 700,

      color: '#111827',

      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',

      marginLeft: 2,
    }}
  >
    {title ??
  topBar.title ??
  (isReader
    ? 'Reader'
    : pathname.startsWith('/resources')
    ? 'Resources'
    : 'EggPuff')}

{pathname === '/communities' && (
  <span
    style={{
      marginLeft: 8,
      padding: '4px 8px',
      borderRadius: 999,
      background: 'rgba(244,197,66,0.15)',
      border: '1px solid rgba(244,197,66,0.35)',
      color: '#B7791F',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.3px',
      flexShrink: 0,
    }}
  >
    BETA
  </span>
)}
  </div>
</div>

      {/* RIGHT */}

<div
  style={{
    flexShrink: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    gap: 8,
  }}
>
  {/* ================= UPLOAD RESOURCE ================= */}

  {pathname === '/resources' && (
    <button
  type="button"
  aria-label="Upload resource"
  onClick={() => {
    router.push('/upload-resource')
  }}
  style={{
    width: 40,
    height: 40,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    padding: 0,

    border: 'none',
    borderRadius: 12,

    background: 'transparent',

    color: '#111827',

    cursor: 'pointer',

    WebkitTapHighlightColor:
      'transparent',
  }}
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    {/* Upload tray */}

    <path
      d="M5 17.5V19.5C5 20.05 5.45 20.5 6 20.5H18C18.55 20.5 19 20.05 19 19.5V17.5"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Upload arrow */}

    <path
      d="M12 16V5"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    <path
      d="M8.5 8.5L12 5L15.5 8.5"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>
  )}

 {/* EXISTING RIGHT SLOT */}

{rightSlot ?? topBar.rightSlot}
</div>
    </div>
  )
}