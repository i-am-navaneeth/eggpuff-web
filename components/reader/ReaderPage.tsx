'use client'

import {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ResourceInfoSheet from '@/components/reader/ResourceInfoSheet'

import { getResource } from '@/lib/resources/getResource'
import { downloadResource } from '@/lib/resources/downloadResource'
import { reportResource } from '@/lib/resources/reportResource'

import { useNotify } from '@/components/NotificationProvider'
import { useShellLayout } from '@/components/ShellLayoutContext'

import Reader from '@/components/reader/Reader'
import ReaderMenu from '@/components/reader/ReaderMenu'

export default function ReaderPage() {
  const params = useParams()

  const router = useRouter()

  const { notify } = useNotify()

  const { setTopBar } =
    useShellLayout()

  const resourceId =
    params.id as string

  const [resource, setResource] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [downloadCount, setDownloadCount] =
    useState(0)

  const [infoOpen, setInfoOpen] =
    useState(false)

  const [numPages, setNumPages] =
useState(0)

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getResource(resourceId)

        setResource(data)

        setDownloadCount(
          data.downloads_count ?? 0
        )
      } finally {
        setLoading(false)
      }
    }

    if (resourceId) {
      load()
    }
  }, [resourceId])

  useLayoutEffect(() => {
    if (!resource) return

    setTopBar({
      title: resource.title,

      showBack: true,

      onBack: () => router.back(),

      rightSlot: (
        <ReaderMenu
          downloadCount={downloadCount}
          fileSize={resource.file_size}
          fileType={resource.file_type}
          onDownload={async () => {
            setDownloadCount(
              (c) => c + 1
            )

            try {
              await downloadResource(
                resource.id,
                resource.file_url,
                resource.file_name
              )
            } catch {
              setDownloadCount(
                (c) => c - 1
              )
            }
          }}
          onInfo={() => {
  setInfoOpen(true)
}}
          onReport={async () => {
            try {
              await reportResource(
                resource.id
              )
            } finally {
              notify(
                '✅ Thanks! Your report has been submitted.'
              )
            }
          }}
        />
      ),
    })

    return () =>
      setTopBar({})
  }, [
    resource,
    downloadCount,
    notify,
    router,
    setTopBar,
  ])

if (loading) {
  return null
}

  if (!resource) {
    return (
      <main
        style={{
          padding: 24,
          textAlign: 'center',
        }}
      >
        Resource not found.
      </main>
    )
  }

  return (
  <>
    <Reader
  resource={{
    ...resource,
    downloads_count:
      downloadCount,
  }}
  onPagesChange={setNumPages}
/>

    <ResourceInfoSheet
      open={infoOpen}
      onClose={() =>
        setInfoOpen(false)
      }
      resource={{
        title: resource.title,

        description:
          resource.description,

        file_name:
          resource.file_name,

        file_type:
          resource.file_type,

        file_size:
          resource.file_size,

        downloads_count:
          downloadCount,

        created_at:
          resource.created_at,

        pages: numPages,

        uploader_name:
          resource.uploader_name,

        college_name:
          resource.college_name,
      }}
    />
  </>
)
}