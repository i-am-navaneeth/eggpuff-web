'use client'

import { useNotificationDrafts } from '@/hooks/useNotificationDrafts'
import type { NotificationDraft } from './NotificationComposer/types'

type Props = {
  onEditDraft?: (draft: NotificationDraft) => void
  onNewDraft?: () => void
}

export default function DraftList({
  onEditDraft,
  onNewDraft,
}: Props) {
  const {
    drafts,
    draftCount,
    deleteDraft,
    duplicateDraft,
  } = useNotificationDrafts()

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #ECECEC',
        boxShadow: '0 8px 24px rgba(0,0,0,.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Drafts
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Saved notifications
          </div>
        </div>

        <div
          style={{
            background: '#F9FAFB',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 13,
            fontWeight: 700,
            color: '#6B7280',
          }}
        >
          {draftCount}
        </div>
      </div>

      {/* Empty State */}
      {draftCount === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 42 }}>📝</div>

          <div
            style={{
              marginTop: 12,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            No drafts yet
          </div>

          <div
            style={{
              marginTop: 6,
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            Saved drafts will appear here.
          </div>
        </div>
      )}

      {/* Draft List */}
      {drafts.map((draft) => (
        <div
          key={draft.id}
          style={{
            padding: 18,
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
           <div
  onClick={() => onEditDraft?.(draft)}
  style={{
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
  }}
>
              <div
                style={{
                  fontWeight: 700,
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {draft.title || 'Untitled Draft'}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: '#6B7280',
                  fontSize: 14,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                }}
              >
                {draft.body || 'No content'}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: '#9CA3AF',
                }}
              >
                Updated{' '}
                {new Date(
                  draft.updatedAt
                ).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <button
                onClick={() =>
                  duplicateDraft(draft.id)
                }
                style={buttonStyle}
              >
                📄
              </button>

              <button
                onClick={() => {
                  if (
                    confirm(
                      'Delete this draft?'
                    )
                  ) {
                    deleteDraft(draft.id)
                  }
                }}
                style={buttonStyle}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div
  style={{
    padding: 16,
    background: '#FAFAFA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  }}
>
  <span
    style={{
      color: '#6B7280',
      fontSize: 13,
    }}
  >
    Drafts are stored locally.
  </span>
</div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid #ECECEC',
  background: '#FFFFFF',
  cursor: 'pointer',
  fontSize: 16,
}