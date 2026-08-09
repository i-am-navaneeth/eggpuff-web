'use client'

import AnimatedCounter from '@/components/AnimatedCounter'

type BackButtonProps = {
  onClick: () => void
}

export function BackButton({
  onClick,
}: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center
        justify-center
        w-8 h-8
        rounded-full
        active:scale-95
        transition
      "
      style={{
        border: 'none',
        background: 'transparent',
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function smartTitle(
  title: React.ReactNode,
  maxLength = 22
) {
  if (typeof title !== 'string') {
    return title
  }

  if (title.length <= maxLength) {
    return title
  }

  const cut =
    title.slice(0, maxLength)

  const lastSpace =
    cut.lastIndexOf(' ')

  if (lastSpace > 6) {
    return (
      cut.slice(0, lastSpace) +
      '…'
    )
  }

  return cut + '…'
}

type DefaultTitleProps = {
  title?: React.ReactNode
  onClick?: () => void
}

export function DefaultTitle({
  title = 'EggPuff',
  onClick,
}: DefaultTitleProps) {
  return (
    <h2
      onClick={onClick}
      className="
        flex-1
        min-w-0

        text-xl sm:text-2xl
        font-semibold

        cursor-pointer
        select-none

        flex items-center gap-1
      "
      style={{
        WebkitTapHighlightColor:
          'transparent',

        userSelect: 'none',

        transition:
          'transform 0.12s ease',

        overflow: 'hidden',

        whiteSpace: 'nowrap',

        textOverflow: 'ellipsis',
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform =
          'scale(0.96)'
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
    >
      {smartTitle(title)}
    </h2>
  )
}

type DefaultBalanceProps = {
  balance: number
  onClick: () => void
}

export function DefaultBalance({
  balance,
  onClick,
}: DefaultBalanceProps) {
  return (
    <button
      onClick={onClick}
      className="
        px-3 sm:px-4 py-1.5
        rounded-full
        text-sm sm:text-base
        font-medium
        bg-gray-100
        border border-gray-200
        text-gray-800
        shadow-sm
      "
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        🥐
      </span>

      <AnimatedCounter value={balance} />
    </button>
  )
}

type ThreeDotsButtonProps = {
  onClick: () => void

  ariaLabel?: string
}

export function ThreeDotsButton({
  onClick,
  ariaLabel = 'More',
}: ThreeDotsButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        flex items-center
        justify-center
        w-9 h-9
        rounded-full
        active:scale-95
        transition
      "
      style={{
        border: 'none',
        background: 'transparent',
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 8H18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M6 12H18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M6 16H18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}