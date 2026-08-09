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

const [pageWidth, setPageWidth] =
  useState(360)

  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(
        Math.min(
          window.innerWidth - 24,
          820
        )
      )
    }

    updateWidth()

    window.addEventListener(
      'resize',
      updateWidth
    )

    return () =>
      window.removeEventListener(
        'resize',
        updateWidth
      )
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
    padding: '12px',
    overflowX: 'auto',
    touchAction: 'pan-x pan-y',
  }}
>

<PdfViewer
  fileUrl={resource.file_url}
  numPages={numPages}
  setNumPages={(pages) => {
    setNumPages(pages)
    onPagesChange?.(pages)
  }}
  pageWidth={pageWidth}
/>

      <div
  style={{
    position: 'fixed',

    right: 14,
    bottom: 26,

    width: 54,
    height: 54,

    zIndex: 999,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    opacity: 0.9,
  }}
>
  <svg
    width="54"
    height="54"
    style={{
      position: 'absolute',
      transform: 'rotate(-90deg)',
    }}
  >
    <circle
      cx="27"
      cy="27"
      r={22}
      stroke="#E5E7EB"
      strokeWidth="3"
      fill="none"
    />

    <circle
      cx="27"
      cy="27"
      r={22}
      stroke="#F4B860"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeDasharray={2 * Math.PI * 22}
      strokeDashoffset={
        (2 * Math.PI * 22) *
        (1 - progress)
      }
      style={{
        transition:
          'stroke-dashoffset .25s ease',
      }}
    />
  </svg>

  <div
    style={{
      width: 42,
      height: 42,

      borderRadius: '50%',

      background: 'rgba(255,255,255,.95)',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      fontWeight: 700,
      fontSize: 12,

      color: '#374151',

      boxShadow:
        '0 4px 12px rgba(0,0,0,.08)',
    }}
  >
    {currentPage}/{numPages}
  </div>
</div>
    </main>
  )
}