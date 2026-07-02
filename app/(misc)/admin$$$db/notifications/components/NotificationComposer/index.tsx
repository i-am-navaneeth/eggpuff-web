'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  NotificationComposerProps,
  NotificationForm,
  ValidationErrors,
} from './types'

import {
  validateNotification,
  canSaveDraft,
  TITLE_MAX_LENGTH,
  BODY_MAX_LENGTH,
} from './Validation'

import TitleField from './TitleField'
import BodyField from './BodyField'
import LinkField from './LinkField'
import CharacterCounter from './CharacterCounter'
import AudienceSelector from './AudienceSelector'
import PreviewCard from './PreviewCard'
import ComposerActions from './ComposerActions'

const INITIAL_FORM: NotificationForm = {
  title: '',
  body: '',
  link: '',

  audience: 'everyone',

  delivery: 'now',

  scheduledFor: null,
}

export default function NotificationComposer({
  draft,
  onSend,
  onSaveDraft,
  onSchedule,
}: NotificationComposerProps) {
  /* ==========================================================
     STATE
  ========================================================== */

  const [form, setForm] =
    useState<NotificationForm>(
      INITIAL_FORM
    )

  const [errors, setErrors] =
    useState<ValidationErrors>({})

  const [loading, setLoading] =
    useState(false)

    useEffect(() => {
  if (draft) {
    setForm({
      title: draft.title,
      body: draft.body,
      link: draft.link,
      audience: draft.audience,
      delivery: draft.delivery,
      scheduledFor: draft.scheduledFor,
    })
  } else {
    setForm(INITIAL_FORM)
  }

  setErrors({})
}, [draft])

  /* ==========================================================
     FIELD UPDATERS
  ========================================================== */

  const updateTitle =
    useCallback(
      (title: string) => {
        setForm(prev => ({
          ...prev,
          title,
        }))

        setErrors(prev => ({
          ...prev,
          title: undefined,
        }))
      },
      []
    )

  const updateBody =
    useCallback(
      (body: string) => {
        setForm(prev => ({
          ...prev,
          body,
        }))

        setErrors(prev => ({
          ...prev,
          body: undefined,
        }))
      },
      []
    )

  const updateLink =
    useCallback(
      (link: string) => {
        setForm(prev => ({
          ...prev,
          link,
        }))

        setErrors(prev => ({
          ...prev,
          link: undefined,
        }))
      },
      []
    )

  const updateAudience =
    useCallback(
      (
        audience: NotificationForm['audience']
      ) => {
        setForm(prev => ({
          ...prev,
          audience,
        }))
      },
      []
    )

    const updateDelivery = useCallback(
  (delivery: NotificationForm["delivery"]) => {
    setForm(prev => ({
      ...prev,
      delivery,
      scheduledFor:
        delivery === "now"
          ? null
          : prev.scheduledFor,
    }))
  },
  []
)

const updateScheduledFor = useCallback(
  (value: string) => {
    setForm(prev => ({
      ...prev,
      scheduledFor: value,
    }))
  },
  []
)

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    useCallback(() => {
      const result =
        validateNotification(
          form.title,
          form.body,
          form.link
        )

      setErrors(result.errors)

      return result.valid
    }, [form])

  /* ==========================================================
     HELPERS
  ========================================================== */

  const resetForm =
    useCallback(() => {
      setForm(INITIAL_FORM)
      setErrors({})
    }, [])

  const draftEnabled =
    useMemo(
      () =>
        canSaveDraft(
          form.title,
          form.body
        ),
      [form.title, form.body]
    )

  const sendEnabled =
    useMemo(
      () =>
        form.title.trim().length > 0 &&
        form.body.trim().length > 0,
      [form.title, form.body]
    )

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const handleSend =
    useCallback(async () => {
      if (!validate()) {
        return
      }

      if (!onSend) {
        console.log(
          'SEND',
          form
        )
        return
      }

      try {
        setLoading(true)

        await onSend(form)

        resetForm()
      } finally {
        setLoading(false)
      }
    }, [
      form,
      onSend,
      validate,
      resetForm,
    ])

  const handleSaveDraft =
    useCallback(async () => {
      if (!draftEnabled) {
        return
      }

      if (!onSaveDraft) {
        console.log(
          'SAVE DRAFT',
          form
        )
        return
      }

      try {
        setLoading(true)

        await onSaveDraft(form)
      } finally {
        setLoading(false)
      }
    }, [
      form,
      draftEnabled,
      onSaveDraft,
    ])

    const handleSchedule = useCallback(async () => {
  if (!validate()) return;

  if (!form.scheduledFor) {
    alert("Please choose a schedule date & time.");
    return;
  }

  if (!onSchedule) {
    console.log("SCHEDULE", form);
    return;
  }

  try {
    setLoading(true);

    await onSchedule(form);

    resetForm();
  } finally {
    setLoading(false);
  }
}, [
  form,
  validate,
  onSchedule,
  resetForm,
]);

  /* ==========================================================
     PART 2 STARTS WITH:
     return (
  ========================================================== */
    return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECEC',
        borderRadius: 20,
        padding: 24,
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',

        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
          }}
        >
          Compose Notification
        </div>

        <div
          style={{
            marginTop: 6,
            color: '#6B7280',
            fontSize: 14,
          }}
        >
          Create a notification for your
          EggPuff community.
        </div>
      </div>

      {/* Title */}
      <div>
        <TitleField
          value={form.title}
          onChange={updateTitle}
          error={errors.title}
        />

        <div
          style={{
            marginTop: 8,
          }}
        >
          <CharacterCounter
            current={form.title.length}
            max={TITLE_MAX_LENGTH}
          />
        </div>
      </div>

      {/* Body */}
      <div>
        <BodyField
          value={form.body}
          onChange={updateBody}
          error={errors.body}
          maxLength={BODY_MAX_LENGTH}
        />

        <div
          style={{
            marginTop: 8,
          }}
        >
          <CharacterCounter
            current={form.body.length}
            max={BODY_MAX_LENGTH}
          />
        </div>
      </div>

      {/* Link */}
      <LinkField
        value={form.link}
        onChange={updateLink}
        error={errors.link}
      />

      {/* Audience */}
      <AudienceSelector
        value={form.audience}
        onChange={updateAudience}
      />

      <div>
  <div
    style={{
      fontWeight: 700,
      marginBottom: 10,
      color: "#111827",
    }}
  >
    Delivery
  </div>

  <div
    style={{
      display: "flex",
      gap: 12,
      marginBottom: 16,
    }}
  >
    <button
      type="button"
      onClick={() => updateDelivery("now")}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border:
          form.delivery === "now"
            ? "2px solid #F4B860"
            : "1px solid #E5E7EB",
        background:
          form.delivery === "now"
            ? "#FFF7E8"
            : "#FFF",
        cursor: "pointer",
      }}
    >
      🚀 Send Now
    </button>

    <button
      type="button"
      onClick={() => updateDelivery("scheduled")}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border:
          form.delivery === "scheduled"
            ? "2px solid #F4B860"
            : "1px solid #E5E7EB",
        background:
          form.delivery === "scheduled"
            ? "#FFF7E8"
            : "#FFF",
        cursor: "pointer",
      }}
    >
      ⏰ Schedule
    </button>
  </div>

  {form.delivery === "scheduled" && (
    <input
      type="datetime-local"
      value={form.scheduledFor ?? ""}
      onChange={e =>
        updateScheduledFor(e.target.value)
      }
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        fontSize: 14,
      }}
    />
  )}
</div>

      {/* Preview */}
      <PreviewCard
        title={form.title}
        body={form.body}
        link={form.link}
      />

      {/* Actions */}
      <ComposerActions
        loading={loading}
        canSend={
  sendEnabled &&
  form.delivery === "now"
}
        canSaveDraft={draftEnabled}
        canSchedule={
  sendEnabled &&
  form.delivery === "scheduled"
}
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
        onSchedule={handleSchedule}
      />
    </div>
  )
}