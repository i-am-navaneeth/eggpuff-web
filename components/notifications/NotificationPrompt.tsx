'use client'

type Props = {
  open: boolean
  onClose: () => void
  onEnable: () => void
}

export default function NotificationPrompt({
  open,
  onClose,
  onEnable,
}: Props) {
  if (!open) return null

  return (
    <>
      {/* Background Blur */}

      <div
        className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}

      <div
        className="
          fixed
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          z-[9999]
          w-[92%]
          max-w-sm
          rounded-3xl
          border
          border-white/10
          bg-neutral-950
          p-7
          shadow-[0_25px_80px_rgba(0,0,0,.45)]
        "
      >
        {/* Icon */}

        <div className="flex justify-center">

          <div
            className="
              h-16
              w-16
              rounded-full
              bg-orange-500/10
              flex
              items-center
              justify-center
              text-3xl
            "
          >
            🔔
          </div>

        </div>

        {/* Title */}

        <h2
          className="
            mt-6
            text-center
            text-2xl
            font-bold
            text-white
          "
        >
          Stay connected
        </h2>

        {/* Description */}

        <p
          className="
            mt-4
            text-center
            leading-7
            text-gray-400
          "
        >
          Get notified when someone answers your
          question, mentions you, follows you, or
          shares a new campus opportunity.
        </p>

        {/* Buttons */}

        <div className="mt-8 flex gap-3">

          <button
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              border
              border-white/10
              py-3
              text-gray-300
              hover:bg-white/5
              transition
            "
          >
            Not now
          </button>

          <button
            onClick={onEnable}
            className="
              flex-1
              rounded-xl
              bg-gradient-to-r
              from-yellow-400
              to-orange-500
              py-3
              font-semibold
              text-black
              hover:scale-[1.02]
              active:scale-95
              transition
            "
          >
            Turn on
          </button>

        </div>

      </div>
    </>
  )
}