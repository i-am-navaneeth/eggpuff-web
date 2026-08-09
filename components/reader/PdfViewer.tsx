'use client'

import {
  Document,
  Page,
} from 'react-pdf'
import { useState } from 'react'

type Props = {
  fileUrl: string

  numPages: number

  setNumPages: (
    pages: number
  ) => void

  pageWidth: number
}

export default function PdfViewer({
  fileUrl,
  numPages,
  setNumPages,
  pageWidth,
}: Props) {

const [loaded, setLoaded] =
  useState(false)

return (
  <>
    {!loaded && (
      <div
        style={{
          minHeight: '75vh',

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',

          color: '#111827',
        }}
      >
        <div
          style={{
            width: 82,
            height: 82,

            borderRadius: 22,

            background: '#F9FAFB',

            border: '1px solid #E5E7EB',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            fontSize: 42,

            marginBottom: 22,
          }}
        >
          📄
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Preparing document...
        </div>

        <div
          style={{
            marginTop: 8,

            color: '#6B7280',

            fontSize: 15,
          }}
        >
          Please wait a moment
        </div>
      </div>
    )}

    <div
      style={{
        opacity: loaded ? 1 : 0,

        transition: 'opacity .35s ease',
      }}
    >
      <Document
        file={fileUrl}
        loading={null}
        error="Failed to load PDF."
       onLoadSuccess={({ numPages }) => {
  setNumPages(numPages)
}}
      >
        {Array.from(
          { length: numPages },
          (_, index) => (
            <div
              key={index}
              style={{
                marginBottom: 18,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Page
  pageNumber={index + 1}
  width={pageWidth}
  renderTextLayer
  renderAnnotationLayer
  onRenderSuccess={() => {
    if (!loaded && index === 0) {
      setLoaded(true)

      window.dispatchEvent(
        new Event('ep-reader-ready')
      )
    }
  }}
/>
            </div>
          )
        )}
      </Document>
    </div>
  </>
)}