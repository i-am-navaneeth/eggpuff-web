'use client'

import type { MatchDraft } from '../CreateMatch'

type Props = {
  draft: MatchDraft
  updateDraft: (
    values: Partial<MatchDraft>
  ) => void
}

export default function StepExtras({
  draft,
  updateDraft,
}: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 32,
      }}
    >
      {/* Requirements */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Requirements
        </h2>

        <p
          style={{
            color: '#6B7280',
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          Optional. Mention anything participants
          should know before joining.
        </p>

        <textarea
          value={draft.requirements}
          onChange={(e) =>
            updateDraft({
              requirements:
                e.target.value,
            })
          }
          placeholder="Example:
• Semester 5+
• React experience
• Mic required
• Bring laptop"
          rows={5}
          maxLength={400}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '16px',
            borderRadius: 16,
            border:
              '1px solid #E5E7EB',
            fontSize: 15,
            lineHeight: 1.6,
            outline: 'none',
          }}
        />

        <div
          style={{
            marginTop: 8,
            textAlign: 'right',
            color: '#9CA3AF',
            fontSize: 13,
          }}
        >
          {draft.requirements.length}/400
        </div>
      </section>

      {/* Tags */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Tags
        </h2>

        <p
          style={{
            color: '#6B7280',
            marginBottom: 18,
            lineHeight: 1.6,
          }}
        >
          Optional. Separate multiple tags with
          commas.
        </p>

        <input
  value={draft.tags.join(', ')}
  onChange={(e) =>
    updateDraft({
      tags: e.target.value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
    })
  }
  placeholder="#React, #OperatingSystems, #Hackathon"
  style={{
    width: '100%',
    padding: '16px',
    borderRadius: 16,
    border: '1px solid #E5E7EB',
    fontSize: 15,
    outline: 'none',
  }}
/>
      </section>

      {/* Review */}

      <section
        style={{
          padding: 22,
          borderRadius: 18,
          background: '#FAFAFA',
          border: '1px solid #ECECEC',
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 18,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Review
        </h2>

        <div
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          <Row
            label="Activity"
            value={draft.activity}
          />

          <Row
            label="Title"
            value={draft.title}
          />

          <Row
  label="People Needed"
  value={String(draft.peopleNeeded)}
/>

          <Row
  label="When"
  value={draft.when}
/>

          <Row
  label="Duration"
  value={
    draft.customDuration ||
    draft.duration
  }
/>

          <Row
            label="Mode"
            value={draft.mode}
          />

          {(draft.mode === 'offline' ||
 draft.mode === 'hybrid') && (
            <Row
              label="Location"
              value={draft.location}
            />
          )}

          {draft.requirements && (
            <Row
              label="Requirements"
              value={draft.requirements}
            />
          )}

          {draft.tags && (
            <Row
  label="Tags"
  value={draft.tags.join(', ')}
/>
          )}
        </div>
      </section>
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value?: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          color: '#6B7280',
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          color: '#111827',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {value || '-'}
      </div>
    </div>
  )
}