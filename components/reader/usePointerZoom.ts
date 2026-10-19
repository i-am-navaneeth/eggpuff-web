'use client'

import { useCallback } from 'react'

export default function usePointerZoom() {
  /*
   * PDF V2:
   *
   * Zoom is handled directly by PdfViewer.
   *
   * PdfViewer changes the React-PDF <Page /> width
   * so the PDF canvas is rendered at the actual
   * zoomed resolution instead of using CSS transform.
   *
   * This hook remains only for compatibility with
   * PdfViewport or any older imports.
   */

  const reset = useCallback(() => {
    // Zoom state is owned by PdfViewer.
  }, [])

  const noop = useCallback(() => { }, [])

  return {
    scale: 1,

    offset: {
      x: 0,
      y: 0,
    },

    reset,

    bind: {
      onPointerDown: noop,
      onPointerMove: noop,
      onPointerUp: noop,
      onPointerCancel: noop,
      onPointerLeave: noop,
    },
  }
}