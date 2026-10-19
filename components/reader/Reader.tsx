'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  pdfjs,
} from 'react-pdf'
import PdfViewer from './PdfViewer'

import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc =
  '/pdf/pdf.worker.min.mjs'

type Props = {
  resource: {
    id: string

    title: string

    description?: string | null

    file_url: string

    file_name?: string

    file_size?: number

    file_type?: string

    downloads_count?: number

    created_at?: string

    user_id?: string

    uploader_name?: string

    college_name?: string
  }

  onPagesChange?: (
    pages: number
  ) => void
}

export default function Reader({
  resource,
  onPagesChange,
}: Props) {

  const [numPages, setNumPages] =
    useState(0)

  const [currentPage, setCurrentPage] =
    useState(1)

  /*
   * Base PDF width.
   *
   * This is the normal reading width.
   *
   * IMPORTANT:
   * Do not make the PDF width respond to
   * zoom here. Zoom belongs to PdfViewer.
   */
  const [pageWidth, setPageWidth] =
    useState(360)

  useEffect(() => {
    const updateWidth = () => {
      const viewportWidth =
        window.innerWidth

      /*
       * Reserve only a small amount of
       * horizontal space around the PDF.
       *
       * Desktop:
       *   maximum readable width = 820px
       *
       * Mobile:
       *   PDF fits the available viewport.
       */
      const availableWidth =
        viewportWidth <= 768
          ? viewportWidth - 24
          : Math.min(
            viewportWidth - 48,
            820
          )

      setPageWidth(
        Math.max(
          280,
          availableWidth
        )
      )
    }

    updateWidth()

    window.addEventListener(
      'resize',
      updateWidth
    )

    return () => {
      window.removeEventListener(
        'resize',
        updateWidth
      )
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const pages =
        document.querySelectorAll(
          '.react-pdf__Page'
        )

      let active = 1

      pages.forEach((page, index) => {
        const rect =
          page.getBoundingClientRect()

        if (
          rect.top <=
          window.innerHeight * 0.35
        ) {
          active = index + 1
        }
      })

      setCurrentPage(active)
    }

    window.addEventListener(
      'scroll',
      handleScroll
    )

    handleScroll()

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      )
  }, [numPages])

  const progress =
    numPages > 0
      ? currentPage / numPages
      : 0

  return (
    <main
      style={{
        background: '#F5F5F5',

        minHeight: '100vh',

        width: '100%',

        padding: '12px',

        /*
         * IMPORTANT
         *
         * Do NOT hide horizontal overflow here.
         *
         * A zoomed PDF can legitimately become
         * wider than the viewport.
         */
        overflowX: 'visible',

        overflowY: 'visible',

        /*
         * The PDF viewer owns its touch gestures.
         */
        touchAction: 'auto',

        boxSizing: 'border-box',

        position: 'relative',
      }}
    >

      {/*
       * ─────────────────────────────────────
       * PDF VIEWPORT
       *
       * This becomes the horizontal viewport
       * for the document.
       *
       * The actual PDF can become wider than
       * this area when zoomed.
       * ─────────────────────────────────────
       */}

      <div
        style={{
          width: '100%',
          maxWidth: '100%',

          position: 'relative',

          /*
           * IMPORTANT:
           *
           * Reader itself must NOT become a
           * scroll container.
           *
           * Vertical mouse-wheel scrolling belongs
           * to the normal document/page.
           *
           * Horizontal scrolling for a zoomed PDF
           * is handled inside PdfViewer.
           */
          overflow: 'visible',

          minWidth: 0,

          boxSizing: 'border-box',

          /*
           * Keep the PDF attached to the normal
           * browser scrolling flow.
           */
          WebkitOverflowScrolling:
            'touch',
        }}
      >
        <PdfViewer
          fileUrl={
            resource.file_url
          }

          numPages={
            numPages
          }

          setNumPages={(
            pages
          ) => {
            setNumPages(
              pages
            )

            onPagesChange?.(
              pages
            )
          }}

          pageWidth={
            pageWidth
          }
        />

        <div
          style={{
            position: 'fixed',

            right: 14,
            bottom: 14,

            width: 44,
            height: 44,

            borderRadius: '50%',

            /*
             * TRUE GLASS
             *
             * Very transparent so the PDF content
             * underneath remains readable.
             */
            background:
              'rgba(255, 255, 255, 0.18)',

            backdropFilter:
              'blur(2px) saturate(115%)',

            WebkitBackdropFilter:
              'blur(2px) saturate(115%)',

            /*
             * Extremely subtle glass edge.
             */
            border:
              '1px solid rgba(255, 255, 255, 0.48)',

            /*
             * Keep it floating without making
             * it visually heavy.
             */
            boxShadow:
              '0 2px 10px rgba(15, 23, 42, 0.08)',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            /*
             * Small because the PDF is the
             * primary focus.
             */
            fontSize: 11,

            fontWeight: 700,

            color: '#334155',

            zIndex: 50,

            boxSizing: 'border-box',

            /*
             * Never interfere with PDF
             * scrolling, dragging or zooming.
             */
            pointerEvents: 'none',
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            style={{
              position: 'absolute',

              inset: 0,

              transform:
                'rotate(-90deg)',
            }}
          >
            {/* Subtle background ring */}
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="rgba(148, 163, 184, 0.16)"
              strokeWidth="2"
            />

            {/* Progress ring */}
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="rgba(244, 185, 66, 0.82)"
              strokeWidth="2"
              strokeLinecap="round"

              strokeDasharray={
                2 * Math.PI * 19
              }

              strokeDashoffset={
                2 *
                Math.PI *
                19 *
                (1 - progress)
              }

              style={{
                transition:
                  'stroke-dashoffset .25s ease',
              }}
            />
          </svg>

          <span
            style={{
              position: 'relative',

              zIndex: 1,

              lineHeight: 1,

              whiteSpace: 'nowrap',

              /*
               * Very subtle text separation
               * without hiding the PDF underneath.
               */
              textShadow:
                '0 1px 2px rgba(255,255,255,0.7)',
            }}
          >
            {numPages > 0
              ? `${currentPage}/${numPages}`
              : ''}
          </span>
        </div>
      </div>
    </main>
  )
}