'use client'

type Props = {
  open: boolean

  onClose: () => void

  resource: {
    title: string

    description?: string | null

    file_name?: string

    file_type?: string

    file_size?: number

    downloads_count?: number

    saves_count?: number

    created_at?: string

    pages?: number

    uploader_name?: string

    college_name?: string
  }
}

export default function ResourceInfoSheet({
  open,
  onClose,
  resource,
}: Props) {

  if (!open) return null

  const formatFileSize = (
    bytes?: number
  ) => {

    if (!bytes) return '-'

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

  const formatDate = (
    date?: string
  ) => {

    if (!date) return '-'

    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,

          background:
            'rgba(0,0,0,.32)',

          zIndex: 5000,
        }}
      />

      {/* Sheet */}
      <div
       style={{
  position: 'fixed',

  inset: 0,

  background: '#fff',

  overflowY: 'auto',

  padding:
    '28px 20px calc(28px + env(safe-area-inset-bottom))',

  zIndex: 5001,
}}
      >

{/* PDF Preview */}
<div
  style={{
    width: 74,
    height: 74,

    borderRadius: 20,

    background: '#F9FAFB',

    border: '1px solid #E5E7EB',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    margin: '0 auto',
  }}
>
  <span
    style={{
      fontSize: 40,
    }}
  >
    📄
  </span>
</div>

{/* Title */}
<div
  style={{
    marginTop: 18,

    textAlign: 'center',
  }}
>
  <div
    style={{
      fontSize: 22,

      fontWeight: 800,

      color: '#111827',

      lineHeight: 1.35,
    }}
  >
    {resource.title}
  </div>

  <div
    style={{
      marginTop: 8,

      color: '#6B7280',

      fontSize: 14,

      fontWeight: 500,
    }}
  >
    {(resource.file_type || 'PDF').toUpperCase()}
    {' • '}
    {formatFileSize(resource.file_size)}
    {' • '}
    {resource.pages ?? '-'} Pages
  </div>
</div>

{/* Description */}
{resource.description?.trim() && (
  <>
    <div
      style={{
        marginTop: 24,
        marginBottom: 24,

        padding: '16px 18px',

        background: '#F9FAFB',

        border: '1px solid #E5E7EB',

        borderRadius: 18,

        maxHeight: 180,

        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#6B7280',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Description
      </div>

      <div
        style={{
          fontSize: 15,
          color: '#374151',
          lineHeight: 1.75,

          whiteSpace: 'pre-wrap',

          wordBreak: 'break-word',

          overflowWrap: 'break-word',
        }}
      >
        {resource.description}
      </div>
    </div>

    <div
      style={{
        height: 1,
        background: '#E5E7EB',
        marginBottom: 24,
      }}
    />
  </>
)}

<div
  style={{
    display: 'flex',
    flexDirection: 'column',
  }}
>

          <InfoRow
            label="File"
            value={
              resource.file_name ||
              '-'
            }
          />

          <InfoRow
            label="Downloads"
            value={
              (
                resource.downloads_count ??
                0
              ).toLocaleString()
            }
          />

          <InfoRow
            label="Saves"
            value={
              (
                resource.saves_count ??
                0
              ).toLocaleString()
            }
          />

          <InfoRow
            label="Uploaded By"
            value={
              resource.uploader_name ||
              '-'
            }
          />

          <InfoRow
            label="College"
            value={
              resource.college_name ||
              '-'
            }
          />

          <InfoRow
            label="Uploaded"
            value={formatDate(
              resource.created_at
            )}
          />

        </div>

        <button
  onClick={onClose}
  style={{
    marginTop: 28,

    width: '100%',

    height: 46,

    border: '1.5px solid #D1D5DB',

    borderRadius: 14,

    background: '#FFFFFF',

    color: '#111827',

    fontSize: 16,

    fontWeight: 700,

    cursor: 'pointer',

    transition: 'all .2s ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background =
      '#F9FAFB'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      '#FFFFFF'
  }}
>
  Close
</button>

      </div>
    </>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string

  value: string
}) {
  return (
    <div
      style={{
        display: 'flex',

        justifyContent: 'space-between',

        alignItems: 'center',

        padding: '14px 0',

        borderBottom:
          '1px solid #F3F4F6',
      }}
    >
      <div
        style={{
          fontSize: 15,

          color: '#6B7280',

          fontWeight: 500,
        }}
      >
        {label}
      </div>

      <div
  style={{
    fontSize: 15,

    color: '#111827',

    fontWeight: 700,

    textAlign: 'right',

    maxWidth: '65%',

    wordBreak: 'break-word',

    overflowWrap: 'anywhere',

    lineHeight: 1.45,
  }}
>
  {value}
</div>
    </div>
  )
}