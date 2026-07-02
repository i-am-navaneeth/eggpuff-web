'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UploadResourcePage() {
  const router = useRouter()

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
      alert('Enter title')
      return
    }

    if (!file) {
      alert('Select PDF')
      return
    }

    const MAX_FILE_SIZE =
  5 * 1024 * 1024 // 5 MB

if (
  file.type !==
  'application/pdf'
) {
  alert(
    'Only PDF files are allowed.'
  )
  return
}

if (
  file.size >
  MAX_FILE_SIZE
) {
  alert(
    'PDF must be smaller than 5 MB.'
  )
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
        alert('Login required')
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

      alert(
        'Upload failed'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        Upload Resource
      </h1>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 12,
          border:
            '1px solid #ddd',
          borderRadius: 10,
        }}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        rows={5}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 12,
          border:
            '1px solid #ddd',
          borderRadius: 10,
        }}
      />

      <input
  type="file"
  accept=".pdf"
  onChange={(e) =>
    setFile(
      e.target.files?.[0] ??
        null
    )
  }
  style={{
    marginBottom: 10,
  }}
/>

<div
  style={{
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 1.5,
  }}
>
  📄 PDF only <br />
  Maximum file size: 5 MB
</div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          width: '100%',
          padding: 14,
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {uploading
          ? 'Uploading...'
          : 'Publish Resource'}
      </button>
    </div>
  )
}