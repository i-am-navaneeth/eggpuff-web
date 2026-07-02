'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Resource = {
  id: string

  title: string

  description: string | null

  file_name?: string

  file_size?: number

  downloads_count?: number

  created_at: string
}

export default function ResourcesPage() {
  const [resources, setResources] =
    useState<Resource[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } =
        await supabase
          .from('resources')
          .select(`
            id,
            title,
            description,
            file_name,
            file_size,
            downloads_count,
            created_at
          `)
          .order(
            'created_at',
            {
              ascending: false,
            }
          )

      setResources(data || [])

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 20,
        }}
      >
        Resources
      </h1>

      {resources.length === 0 && (
        <div>
          No resources yet.
        </div>
      )}

      {resources.map(resource => (
        <Link
          key={resource.id}
          href={`/resource/${resource.id}`}
          style={{
            display: 'block',

            textDecoration:
              'none',

            color: 'inherit',

            border:
              '1px solid #E5E7EB',

            borderRadius: 16,

            padding: 18,

            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            📄 {resource.title}
          </div>

          {resource.description && (
            <div
              style={{
                color: '#64748B',
                marginBottom: 12,
              }}
            >
              {resource.description}
            </div>
          )}

          <div
            style={{
              fontSize: 13,
              color: '#94A3B8',
            }}
          >
            {(
              (resource.file_size || 0) /
              1024 /
              1024
            ).toFixed(1)}
            MB
          </div>
        </Link>
      ))}
    </div>
  )
}