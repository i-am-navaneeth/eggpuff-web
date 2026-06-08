'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Resource = {
  id: string
  title: string
  description: string | null

  file_url: string

  file_name?: string
  file_size?: number

  downloads_count?: number
  saves_count?: number

  created_at: string

  user_id: string
}

export default function ResourcePage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = use(params)

  const [isGuest, setIsGuest] =
  useState(false)

  const [resource, setResource] =
    useState<Resource | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data,
        error,
      } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single()

      const {
  data: { session },
} = await supabase.auth.getSession()

setIsGuest(!session)

      if (error) {
        console.error(error)
      }

      setResource(data)

      setLoading(false)
    }

    load()
  }, [id])

  const shareResource =
    async () => {

      const url =
        window.location.href

      try {

        if (
          navigator.share
        ) {

          await navigator.share({
            title:
              resource?.title,

            text:
              resource?.description ??
              '',

            url,
          })

        } else {

          await navigator.clipboard.writeText(
            url
          )

          alert(
            'Link copied'
          )
        }

      } catch {}
    }

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!resource) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
        }}
      >
        Resource not found
      </div>
    )
  }

  const isPdf =
    resource.file_url
      ?.toLowerCase()
      .includes('.pdf')

  const formatFileSize = (
    bytes?: number
  ) => {

    if (!bytes)
      return null

    const mb =
      bytes /
      1024 /
      1024

    return `${mb.toFixed(
      1
    )} MB`
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: 24,
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          fontSize: 34,
          fontWeight: 800,
          lineHeight: 1.25,
          color: '#0F172A',
          marginBottom: 12,
        }}
      >
        {resource.title}
      </h1>

      {/* DESCRIPTION */}

      {resource.description && (
        <p
          style={{
            color: '#64748B',
            fontSize: 16,
            lineHeight: 1.7,
            whiteSpace:
              'pre-wrap',
            marginBottom: 20,
          }}
        >
          {resource.description}
        </p>
      )}

      {/* FILE INFO */}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          fontSize: 14,
          color: '#64748B',
        }}
      >
        {resource.file_name && (
          <div>
            📄 {resource.file_name}
          </div>
        )}

        {resource.file_size && (
          <div>
            {formatFileSize(
              resource.file_size
            )}
          </div>
        )}

        <div>
          ⬇{' '}
          {resource.downloads_count ??
            0}{' '}
          downloads
        </div>
      </div>

      {/* ACTIONS */}

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <button
          onClick={
            shareResource
          }
          style={{
            padding:
              '12px 18px',
            borderRadius: 14,
            border:
              '1px solid #E5E7EB',
            background:
              '#FFFFFF',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Share
        </button>

        <a
          href={
            resource.file_url
          }
          target="_blank"
          rel="noreferrer"
          download
          style={{
            padding:
              '12px 18px',
            borderRadius: 14,
            border:
              '1px solid #111827',
            background:
              '#111827',
            color: '#FFFFFF',
            textDecoration:
              'none',
            fontWeight: 600,
          }}
        >
          Download PDF
        </a>
      </div>

      {/* PDF VIEWER */}

      {isPdf ? (
        <div
          style={{
            border:
              '1px solid #E5E7EB',
            borderRadius: 18,
            overflow:
              'hidden',
            background:
              '#FFFFFF',
          }}
        >
          <iframe
            src={
              resource.file_url
            }
            width="100%"
            height="900"
            style={{
              border: 'none',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            border:
              '1px solid #E5E7EB',
            borderRadius: 18,
            padding: 24,
            background:
              '#FFFFFF',
            textAlign:
              'center',
          }}
        >
          Preview unavailable.

          <div
            style={{
              marginTop: 16,
            }}
          >
            <a
              href={
                resource.file_url
              }
              target="_blank"
              rel="noreferrer"
            >
              Open file
            </a>
          </div>
        </div>
      )}
      {isGuest && (
  <div
    style={{
      marginTop: 24,

      padding: 24,

      borderRadius: 20,

      background:
        'linear-gradient(135deg,#FFF7ED,#FEF3C7)',

      border:
        '1px solid #F4B860',

      textAlign: 'center',
    }}
  >
    <div
      style={{
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 8,
      }}
    >
      Like these notes? 📚
    </div>

    <div
      style={{
        color: '#6B7280',
        marginBottom: 18,
        lineHeight: 1.6,
      }}
    >
      Join EggPuff to ask questions,
      share resources, and connect
      with students.
    </div>

    <a
      href={`/login?next=/resource/${id}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '14px 24px',

        borderRadius: 999,

        background: '#F4B860',

        color: '#111827',

        fontWeight: 700,

        textDecoration: 'none',
      }}
    >
      Join EggPuff
    </a>
  </div>
)}
    </div>
  )
}