'use client'

import {
  useState,
  useEffect,
} from 'react'

import { createPortal } from 'react-dom'

type Props = {
  downloadCount?: number

  fileSize?: number

  fileType?: string

  onDownload: () => void

  onInfo: () => void

  onReport: () => void
}

function formatFileSize(
  bytes?: number
) {
  if (!bytes) return ''

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ]

  let size = bytes
  let unit = 0

  while (
    size >= 1024 &&
    unit < units.length - 1
  ) {
    size /= 1024
    unit++
  }

  return `${size.toFixed(
    size >= 10 ? 0 : 1
  )} ${units[unit]}`
}

export default function ReaderMenu({
  downloadCount = 0,
  fileSize,
  fileType,
  onDownload,
  onInfo,
  onReport,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const [mounted, setMounted] =
  useState(false)

useEffect(() => {
  setMounted(true)
}, [])

  const close = () =>
    setOpen(false)

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() =>
          setOpen(true)
        }
        aria-label="More"
        style={{
          width: 38,
          height: 38,

          border: 'none',

          background:
            'transparent',

          borderRadius: 999,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          cursor: 'pointer',
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

      {mounted &&
  createPortal(
    <>
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.28)',
            zIndex: 4000,
          }}
        />
      )}

      {open && (
        <div
          style={{
            position: 'fixed',

            left: 0,
            right: 0,
            bottom: 0,

            background: '#fff',

            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,

            padding:
              '18px 18px calc(18px + env(safe-area-inset-bottom))',

            zIndex: 4001,

            boxShadow:
              '0 -8px 40px rgba(0,0,0,.12)',
          }}
        >
    {/* Handle */}
    <div
      style={{
        width: 46,
        height: 5,

        borderRadius: 999,

        background: '#D1D5DB',

        margin: '0 auto 18px',
      }}
    />

    {/* Download */}
    <button
      onClick={() => {
        close()
        onDownload()
      }}
      style={itemStyle}
    >
      <DownloadIcon />

      <div>
        <div style={titleStyle}>
          Download
        </div>

       <div style={subtitleStyle}>
  {fileType?.toUpperCase() || 'PDF'}
  {' • '}
  {formatFileSize(fileSize)}
</div>
      </div>
    </button>

    {/* Info */}
    <button
      onClick={() => {
        close()
        onInfo()
      }}
      style={itemStyle}
    >
      <InfoIcon />

      <div style={titleStyle}>
        Resource Information
      </div>
    </button>

    {/* Report */}
    <button
      onClick={() => {
        close()
        onReport()
      }}
      style={itemStyle}
    >
      <ReportIcon />

      <div
        style={{
          ...titleStyle,
          color: '#DC2626',
        }}
      >
        Report Resource
      </div>
    </button>
   </div>
      )}
    </>,
    document.body
  )}
    </>
  )
}

const itemStyle: React.CSSProperties =
  {
    width: '100%',

    display: 'flex',

    alignItems: 'center',

    gap: 16,

    padding: '16px 4px',

    border: 'none',

    background:
      'transparent',

    cursor: 'pointer',

    textAlign: 'left',
  }

const titleStyle: React.CSSProperties =
  {
    fontWeight: 700,

    fontSize: 16,

    color: '#111827',
  }

const subtitleStyle: React.CSSProperties =
  {
    fontSize: 13,

    color: '#6B7280',

    marginTop: 2,
  }

function DownloadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 4V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M8 11L12 15L16 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 19H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M12 10V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="7"
        r="1"
        fill="currentColor"
      />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 20V5"

        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M6 5H17L15 9L17 13H6"

        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}