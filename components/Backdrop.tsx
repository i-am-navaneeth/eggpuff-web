'use client'

type Props = {
  visible: boolean
  onClick?: () => void
}

export default function Backdrop({ visible, onClick }: Props) {
  if (!visible) return null

  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,

        /* DIM BACKGROUND */
        background: 'rgba(0,0,0,0.55)',

        /* SOFT BLUR */
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',

        /* IMPORTANT: allow clicks */
        pointerEvents: 'auto',
      }}
    />
  )
}
