'use client'

import {
  useState,
} from 'react'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNotify } from '@/components/NotificationProvider'
import PublicTopBar from '@/components/PublicTopBar'

export default function UploadResourcePage() {
const router = useRouter()
const { notify } = useNotify()

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [file, setFile] =
    useState<File | null>(null)

  const [uploading, setUploading] =
    useState(false)

  const handleUpload = async () => {
   if (!title.trim()) {
  notify('⚠️ Enter a title.')
  return
}

if (!file) {
  notify('⚠️ Select a PDF.')
  return
}

const MAX_FILE_SIZE =
  5 * 1024 * 1024 // 5 MB

if (
  file.type !==
  'application/pdf'
) {
  notify('⚠️ Only PDF files are allowed.')
  return
}

if (
  file.size >
  MAX_FILE_SIZE
) {
  notify('⚠️ PDF must be smaller than 5 MB.')
  return
}

    try {
      setUploading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user =
        session?.user

      if (!user) {
  notify('⚠️ Login required.')
  return
}

      const fileExt =
        file.name.split('.').pop()

      const filePath =
        `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } =
        await supabase.storage
          .from('resources')
          .upload(
            filePath,
            file,
            {
              upsert: false,
            }
          )

      if (uploadError) {
        throw uploadError
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from('resources')
        .getPublicUrl(
          filePath
        )

      const fileUrl =
        publicUrlData.publicUrl

      const {
        data: resource,
        error: insertError,
      } = await supabase
        .from('resources')
        .insert({
          user_id: user.id,

          title,

          description,

          file_url: fileUrl,

          file_name:
            file.name,

          file_size:
            file.size,

          file_type:
            file.type,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      router.push(
        `/resource/${resource.id}`
      )

} catch (err) {
  console.error(err)

  notify('❌ Upload failed.')
} finally {
      setUploading(false)
    }
  }

 return (
  <>
    {/* ================= TOP BAR ================= */}

    {/* ================= TOP BAR ================= */}

<header
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 50,

    width: '100%',
    height: 68,

    display: 'flex',
    alignItems: 'center',

    background: '#FFFFFF',

    borderBottom:
      '1px solid #E2E8F0',

    boxSizing: 'border-box',

    padding: '0 18px',

    WebkitBackdropFilter:
      'blur(12px)',

    backdropFilter:
      'blur(12px)',
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: 720,
      margin: '0 auto',

      display: 'flex',
      alignItems: 'center',

      gap: 2,
    }}
  >

    {/* BACK BUTTON */}

<button
  type="button"
  aria-label="Go back"
  onClick={() => {
    router.back()
  }}
  style={{
    width: 38,
    height: 38,

    flexShrink: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    border: 'none',
    borderRadius: 12,

    background: 'transparent',

    color: '#0F172A',

    cursor: 'pointer',

    padding: 0,

    WebkitTapHighlightColor:
      'transparent',
  }}
>
  <svg
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>

    {/* TITLE */}

    <div
      style={{
        minWidth: 0,

        color: '#0F172A',

        fontSize: 21,

        fontWeight: 750,

        lineHeight: 1.15,

        letterSpacing:
          '-0.4px',

        whiteSpace: 'nowrap',

        overflow: 'hidden',

        textOverflow:
          'ellipsis',
      }}
    >
      Upload Resource
    </div>

  </div>
</header>

    <main
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        padding:
          '28px 18px 110px',
      }}
    >
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >


      {/* ================= FORM CARD ================= */}

      <section
        style={{
          background: '#FFFFFF',

          border:
            '1px solid #E2E8F0',

          borderRadius: 24,

          padding:
            '24px',

          boxShadow:
            '0 8px 30px rgba(15, 23, 42, 0.05)',
        }}
      >

        {/* ================= TITLE ================= */}

        <div
          style={{
            marginBottom: 20,
          }}
        >
          <label
            htmlFor="resource-title"
            style={{
              display: 'block',

              marginBottom: 8,

              color: '#0F172A',

              fontSize: 14,

              fontWeight: 750,
            }}
          >
            Resource title
          </label>

          <input
            id="resource-title"
            type="text"
            placeholder="e.g. Data Structures Notes"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={true}
            name="resource-title"
            data-form-type="other"
            style={{
              width: '100%',
              height: 54,

              boxSizing:
                'border-box',

              padding:
                '0 16px',

              border:
                '1px solid #CBD5E1',

              borderRadius: 14,

              background: '#FFFFFF',

              color: '#0F172A',

              fontSize: 16,

              outline: 'none',

              transition:
                'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                '#F4B860'

              e.currentTarget.style.boxShadow =
                '0 0 0 4px rgba(244, 184, 96, 0.14)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                '#CBD5E1'

              e.currentTarget.style.boxShadow =
                'none'
            }}
          />
        </div>

        {/* ================= DESCRIPTION ================= */}

        <div
          style={{
            marginBottom: 20,
          }}
        >
          <label
            htmlFor="resource-description"
            style={{
              display: 'block',

              marginBottom: 8,

              color: '#0F172A',

              fontSize: 14,

              fontWeight: 750,
            }}
          >
            Description
            <span
              style={{
                color: '#94A3B8',
                fontWeight: 500,
              }}
            >
              {' '}
             
            </span>
          </label>

          <textarea
            id="resource-description"
            placeholder="About this resource..."
            value={description}
            onChange={(e) => {
              setDescription(
                e.target.value
              )

              e.currentTarget.style.height =
                'auto'

              e.currentTarget.style.height =
                `${e.currentTarget.scrollHeight}px`
            }}
            rows={1}
            style={{
              width: '100%',

              minHeight: 54,

              boxSizing:
                'border-box',

              padding:
                '14px 16px',

              border:
                '1px solid #CBD5E1',

              borderRadius: 14,

              background: '#FFFFFF',

              color: '#0F172A',

              fontSize: 16,

              lineHeight: 1.5,

              outline: 'none',

              resize: 'none',

              overflow: 'hidden',

              fontFamily:
                'inherit',

              transition:
                'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor =
                '#F4B860'

              e.currentTarget.style.boxShadow =
                '0 0 0 4px rgba(244, 184, 96, 0.14)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                '#CBD5E1'

              e.currentTarget.style.boxShadow =
                'none'
            }}
          />
        </div>

        {/* ================= PDF UPLOAD ================= */}

<div
  style={{
    marginBottom: 24,
  }}
>
  <label
    htmlFor="resource-file"
    style={{
      display: 'block',

      marginBottom: 8,

      color: '#0F172A',

      fontSize: 14,

      fontWeight: 750,
    }}
  >
    PDF file
  </label>

  <div
    style={{
      position: 'relative',
    }}
  >
    <label
      htmlFor="resource-file"
      style={{
        display: 'flex',

        alignItems: 'center',

        gap: 14,

        width: '100%',

        boxSizing: 'border-box',

        padding: '16px',

        paddingRight: file
          ? 58
          : 16,

        border:
          '1.5px dashed #CBD5E1',

        borderRadius: 17,

        background: '#F8FAFC',

        cursor: 'pointer',

        transition:
          'background-color 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          '#FFFDF8'

        e.currentTarget.style.borderColor =
          '#F4B860'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          '#F8FAFC'

        e.currentTarget.style.borderColor =
          '#CBD5E1'
      }}
    >
      {/* PDF ICON */}

      <div
        style={{
          width: 46,
          height: 46,

          flexShrink: 0,

          borderRadius: 13,

          background: '#FFFFFF',

          border:
            '1px solid #E2E8F0',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          fontSize: 21,
        }}
      >
        📄
      </div>

      {/* FILE TEXT */}

      <div
        style={{
          minWidth: 0,

          flex: 1,
        }}
      >
        <div
          style={{
            color: '#0F172A',

            fontSize: 15,

            fontWeight: 750,

            overflow: 'hidden',

            textOverflow:
              'ellipsis',

            whiteSpace: 'nowrap',
          }}
        >
          {file
            ? file.name
            : 'Choose a PDF'}
        </div>

        <div
          style={{
            marginTop: 3,

            color: '#94A3B8',

            fontSize: 13,

            lineHeight: 1.4,
          }}
        >
          {file
            ? `${(
                file.size /
                1024 /
                1024
              ).toFixed(2)} MB`
            : 'PDF only · Max 5 MB'}
        </div>
      </div>

      {/* BROWSE */}

      {!file && (
        <div
          style={{
            flexShrink: 0,

            padding:
              '8px 11px',

            borderRadius: 10,

            background: '#FFFFFF',

            border:
              '1px solid #E2E8F0',

            color: '#334155',

            fontSize: 13,

            fontWeight: 700,
          }}
        >
          Browse
        </div>
      )}
    </label>

    {/* REMOVE FILE BUTTON */}

    {file && (
      <button
        type="button"
        aria-label="Remove selected file"
        onClick={() => {
          setFile(null)

          const input =
            document.getElementById(
              'resource-file'
            ) as HTMLInputElement | null

          if (input) {
            input.value = ''
          }
        }}
        style={{
          position: 'absolute',

          top: 12,

          right: 12,

          width: 32,

          height: 32,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          border: 'none',

          borderRadius: '50%',

          background: '#FFFFFF',

          color: '#64748B',

          fontSize: 20,

          lineHeight: 1,

          cursor: 'pointer',

          boxShadow:
            '0 2px 8px rgba(15, 23, 42, 0.08)',

          transition:
            'background-color 0.15s ease, color 0.15s ease, transform 0.1s ease',

          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            '#F1F5F9'

          e.currentTarget.style.color =
            '#0F172A'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            '#FFFFFF'

          e.currentTarget.style.color =
            '#64748B'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform =
            'scale(0.92)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform =
            'scale(1)'
        }}
      >
        ×
      </button>
    )}
  </div>

  <input
    id="resource-file"
    type="file"
    accept=".pdf"
    onChange={(e) =>
      setFile(
        e.target.files?.[0] ??
        null
      )
    }
    style={{
      display: 'none',
    }}
  />
</div>

        {/* ================= PUBLISH ================= */}

        <button
  type="button"
  onClick={handleUpload}
  disabled={
    uploading ||
    !title.trim() ||
    !description.trim() ||
    !file
  }
  style={{
    width: '100%',

    height: 56,

    border: 'none',

    borderRadius: 15,

    background:
      uploading ||
      !title.trim() ||
      !description.trim() ||
      !file
        ? '#E2E8F0'
        : '#111827',

    color:
      uploading ||
      !title.trim() ||
      !description.trim() ||
      !file
        ? '#94A3B8'
        : '#FFFFFF',

    fontSize: 16,

    fontWeight: 750,

    cursor:
      uploading ||
      !title.trim() ||
      !description.trim() ||
      !file
        ? 'not-allowed'
        : 'pointer',

    boxShadow:
      uploading ||
      !title.trim() ||
      !description.trim() ||
      !file
        ? 'none'
        : '0 6px 16px rgba(15, 23, 42, 0.12)',

    transition:
      'transform 0.1s ease, background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease',

    WebkitTapHighlightColor:
      'transparent',
  }}

  onMouseDown={(e) => {
    const disabled =
      uploading ||
      !title.trim() ||
      !description.trim() ||
      !file

    if (!disabled) {
      e.currentTarget.style.transform =
        'scale(0.985)'
    }
  }}

  onMouseUp={(e) => {
    e.currentTarget.style.transform =
      'scale(1)'
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      'scale(1)'
  }}
>
  {uploading
    ? 'Uploading resource...'
    : 'Publish Resource'}
</button>

      </section>

      {/* ================= FOOTNOTE ================= */}

      <p
        style={{
          marginTop: 16,

          textAlign: 'center',

          color: '#94A3B8',

          fontSize: 12,

          lineHeight: 1.5,
        }}
      >
        By publishing, you're sharing
        this resource with the EggPuff
        student community.
      </p>

    </div>
      </main>
  </>
)}