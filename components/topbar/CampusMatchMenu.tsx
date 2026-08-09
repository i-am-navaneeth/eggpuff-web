'use client'

import TopBarSlideMenu from '@/components/sheet/TopBarSlideMenu'
import ConfirmationSheet from '@/components/ui/ConfirmationSheet'
import { useState } from 'react'

type Props = {
  currentUserId: string | null

  match: {
    creator_id: string
    joined: boolean
  }

  onInvite?: () => void
  onReport?: () => void
  onLeave?: () => void
  onDelete?: () => void
}

export default function CampusMatchMenu({
  currentUserId,
  match,
  onInvite,
  onReport,
  onLeave,
  onDelete,
}: Props) {
const [open, setOpen] = useState(false)

const [showLeaveSheet, setShowLeaveSheet] =
  useState(false)

const [showDeleteSheet, setShowDeleteSheet] =
  useState(false)

const isOwner =
  (() => {
    console.log('currentUserId:', currentUserId)
    console.log('creator_id:', match.creator_id)
    console.log(
      'isOwner:',
      currentUserId === match.creator_id
    )

    return currentUserId === match.creator_id
  })()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 40,
          height: 40,
          border: 'none',
          borderRadius: 999,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="More actions"
      >
        <svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
>
  <path
    d="M4 7H20"
    stroke="#111827"
    strokeWidth="2.2"
    strokeLinecap="round"
  />
  <path
    d="M4 12H20"
    stroke="#111827"
    strokeWidth="2.2"
    strokeLinecap="round"
  />
  <path
    d="M4 17H20"
    stroke="#111827"
    strokeWidth="2.2"
    strokeLinecap="round"
  />
</svg>
      </button>

      <TopBarSlideMenu
        open={open}
        onClose={() => setOpen(false)}
        title="Actions"
      >
       <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: '#fff',
    position: 'relative',
    zIndex: 10,
  }}
>

  <ActionButton
    icon="invite"
    label="Invite classmates"
    onClick={() => {
      setOpen(false)
      onInvite?.()
    }}
  />

  {!isOwner && (
    <ActionButton
      icon="report"
      label="Report Match"
      onClick={() => {
        setOpen(false)
        onReport?.()
      }}
    />
  )}

  <div
    style={{
      height: 1,
      background: '#F1F1F1',
      margin: '6px 0',
    }}
  />

  {isOwner ? (
<ActionButton
  icon="delete"
  label="Delete Match"
  danger
  onClick={() => {
    setOpen(false)
    setShowDeleteSheet(true)
  }}
/>
  ) : (
    match.joined && (
      <ActionButton
        icon="leave"
        label="Leave Match"
        danger
        onClick={() => {
          setOpen(false)
          setShowLeaveSheet(true)
        }}
      />
    )
  )}
</div>
      </TopBarSlideMenu>
      <ConfirmationSheet
  open={showLeaveSheet}
  title="Leave Campus Match?"
  description="You'll leave this match and won't receive new messages unless you join again."
  confirmText="Leave Match"
  cancelText="Stay"
  confirmColor="#EF4444"
  loading={false}
  onCancel={() =>
    setShowLeaveSheet(false)
  }
  onConfirm={() => {
    setShowLeaveSheet(false)
    onLeave?.()
  }}
/>
<ConfirmationSheet
  open={showDeleteSheet}
  title="Delete Campus Match?"
  description="This action cannot be undone. The match and all of its participants will be permanently removed."
  confirmText="Delete Match"
  cancelText="Cancel"
  confirmColor="#DC2626"
  loading={false}
  onCancel={() =>
    setShowDeleteSheet(false)
  }
  onConfirm={() => {
    setShowDeleteSheet(false)
    onDelete?.()
  }}
/>
    </>
  )
}

type ActionButtonProps = {
  icon: string

  label: string

  onClick: () => void

  danger?: boolean
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
}: ActionButtonProps) {
  const Icon = () => {
    switch (icon) {
      case 'invite':
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M16 21V19C16 17.9 15.1 17 14 17H6C4.9 17 4 17.9 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="10"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19 8V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M16 11H22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )

      case 'report':
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 3V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 4H18L15 9L18 14H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )

      case 'leave':
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10 17L15 12L10 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M21 21V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )

      case 'delete':
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 6H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 6V4H16V6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19 6L18 20C17.9 21.1 17 22 16 22H8C7 22 6.1 21.1 6 20L5 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M10 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )

      default:
        return null
    }
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        border: 'none',
        borderRadius: 14,
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 600,
        color: danger
          ? '#DC2626'
          : '#111827',
        transition: 'background .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? '#FEF2F2'
          : '#F8F8F8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          'transparent'
      }}
    >
      <span
        style={{
          width: 28,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon />
      </span>

      <span>{label}</span>
    </button>
  )
}