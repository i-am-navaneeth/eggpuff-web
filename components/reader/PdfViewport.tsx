'use client'

import {
  ReactNode,
} from 'react'

import usePointerZoom from './usePointerZoom'

type Props = {
  children: ReactNode
}

export default function PdfViewport({
  children,
}: Props) {
  const {
    scale,
    offset,
    bind,
  } = usePointerZoom()

  return (
    <div
      {...bind}
      style={{
        width: '100%',

        overflow: 'hidden',

        touchAction: 'none',

        display: 'flex',

        justifyContent: 'center',

        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          transform: `
            translate(
              ${offset.x}px,
              ${offset.y}px
            )
            scale(${scale})
          `,

          transformOrigin:
            'center top',

          transition:
            scale === 1
              ? 'transform .15s ease'
              : 'none',

          willChange:
            'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}