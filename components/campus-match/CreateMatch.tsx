'use client'

import { useState } from 'react'
import StepBasics from './steps/StepBasics'
import StepDetails from './steps/StepDetails'
import StepExtras from './steps/StepExtras'
import { createMatch } from '@/lib/campus-match/createMatch'
import { useRouter } from 'next/navigation'
import { useNotify } from '@/components/NotificationProvider'

export type MatchDraft = {
  activity: string

  title: string

  description: string

  peopleNeeded: number

  when: string

  customDate: string | null

  duration: string

  customDuration: string | null

  mode: 'online' | 'offline' | 'hybrid'

  location: string

  requirements: string

  tags: string[]
}

const TOTAL_STEPS = 3

const initialDraft: MatchDraft = {
  activity: '',

  title: '',

  description: '',

  peopleNeeded: 1,

  when: 'now',

  customDate: null,

  duration: '30 mins',

  customDuration: null,

  mode: 'online',

  location: '',

  requirements: '',

  tags: [],
}

export default function CreateMatch() {

  const router = useRouter()
  const { notify } = useNotify()

const [step, setStep] = useState(1)

const [loading, setLoading] =
  useState(false)

const [draft, setDraft] =
  useState<MatchDraft>(initialDraft)

  function updateDraft(
    values: Partial<MatchDraft>
  ) {
    setDraft((prev) => ({
      ...prev,
      ...values,
    }))
  }

  function nextStep() {
    setStep((prev) =>
      Math.min(prev + 1, TOTAL_STEPS)
    )
  }

  function previousStep() {
    setStep((prev) =>
      Math.max(prev - 1, 1)
    )
  }

async function handleSubmit() {
  try {
    setLoading(true)

    const match = await createMatch(draft)

    router.push(`/campus-match/${match.id}`)
  } catch (err: any) {
    console.error('========================')
    console.error('Campus Match Error')
    console.error('Full Error:', err)
    console.error('Message:', err?.message)
    console.error('Details:', err?.details)
    console.error('Hint:', err?.hint)
    console.error('Code:', err?.code)
    console.error('========================')

    console.error(err)

notify(
  `❌ ${
    err?.message ??
    'Unable to create Campus Match.'
  }`
)
  } finally {
    setLoading(false)
  }
}

return (
  <main
    style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '24px 18px 120px',
    }}
  >
    <p
      style={{
        color: '#6B7280',
        marginBottom: 32,
        fontWeight: 600,
      }}
    >
      Step {step} of {TOTAL_STEPS}
    </p>

      {step === 1 && (
  <StepBasics
    draft={draft}
    updateDraft={updateDraft}
  />
)}

{step === 2 && (
  <StepDetails
    draft={draft}
    updateDraft={updateDraft}
  />
)}

{step === 3 && (
  <StepExtras
    draft={draft}
    updateDraft={updateDraft}
  />
)}

      <div
        style={{
          marginTop: 48,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <button
  onClick={previousStep}
  disabled={
    step === 1 || loading
  }
>
          Back
        </button>

        {step === TOTAL_STEPS ? (
          <button
  onClick={handleSubmit}
  disabled={loading}
>
  {loading
    ? 'Creating...'
    : 'Create Match'}
</button>
        ) : (
          <button
  onClick={nextStep}
  disabled={loading}
>
  Continue
</button>
        )}
      </div>
    </main>
  )
}