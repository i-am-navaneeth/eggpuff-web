'use client'

import {
  ReactNode,
} from 'react'

type Props = {
  children: ReactNode
}

export default function PdfViewport({
  children,
}: Props) {
  return (
    <div
      style={{
        width: '100%',

        /*
         * Allow the PDF to become wider than
         * the viewport when zoomed.
         */
        overflowX: 'auto',
        overflowY: 'visible',

        /*
         * Let the browser handle normal
         * scrolling and native pinch zoom.
         */
        touchAction:
          'pan-x pan-y pinch-zoom',

        display: 'flex',

        justifyContent: 'center',

        alignItems: 'flex-start',

        WebkitOverflowScrolling:
          'touch',

        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',

          /*
           * Do NOT use transform: scale()
           *
           * PdfViewer now controls the actual
           * PDF rendering width. This means
           * zooming creates a larger canvas
           * instead of enlarging a small canvas.
           */
          transform: 'none',

          transformOrigin:
            'center top',

          willChange: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}