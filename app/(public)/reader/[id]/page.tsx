'use client'

import {
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { useShellLayout } from '@/components/ShellLayoutContext'
import { useParams } from 'next/navigation'

import { getResource } from '@/lib/resources/getResource'
import Reader from '@/components/reader/Reader'
import ReaderMenu from '@/components/reader/ReaderMenu'
import { downloadResource } from '@/lib/resources/downloadResource'
import { reportResource } from '@/lib/resources/reportResource'
import { useNotify } from '@/components/NotificationProvider'
import ResourceInfoSheet from '@/components/reader/ResourceInfoSheet'

export default function ReaderPage() {
  const params = useParams()

  const resourceId = params.id as string

  const [resource, setResource] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [downloadCount, setDownloadCount] =
  useState(0)

const [infoOpen, setInfoOpen] =
  useState(false)

  const { setTopBar } =
   useShellLayout()

  const router =
    useRouter()

  const { notify } = useNotify()

const [pages, setPages] =
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
      } catch (err) {
        console.error(err)
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

  /*
   * Reader navigation sources:
   *
   * /resource/[id] → /reader/[id]
   * /resources     → /reader/[id]
   *
   * Direct:
   * External URL → /reader/[id]
   *
   * Only a truly direct Reader entry should eventually
   * cause Resources → Feed to perform a full refresh.
   */

  if (typeof window !== 'undefined') {
    const backUrl =
      sessionStorage.getItem(
        'eggpuff_reader_back_url'
      )

    const fromResources =
      sessionStorage.getItem(
        'eggpuff_reader_from_resources'
      ) === 'true'

    const hasKnownReaderSource =
      Boolean(backUrl) ||
      fromResources

    const referrer =
      document.referrer

    const isInternalReferrer =
      referrer.startsWith(
        window.location.origin
      )

    /*
     * Only mark the Reader as a direct entry when:
     *
     * 1. There is no known Reader source, AND
     * 2. The browser referrer is not an EggPuff URL.
     */
    if (
      !hasKnownReaderSource &&
      !isInternalReferrer
    ) {
      sessionStorage.setItem(
        'eggpuff_direct_resource_entry',
        'true'
      )
    }
  }

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      /*
       * Reader opened from:
       *
       * /resource/[id]
       *       ↓
       * /reader/[id]
       *
       * Return to the existing Resource page.
       */
      const backUrl =
        sessionStorage.getItem(
          'eggpuff_reader_back_url'
        )

      if (backUrl) {
        sessionStorage.removeItem(
          'eggpuff_reader_back_url'
        )

        router.back()
        return
      }

      /*
       * Reader opened directly from:
       *
       * /resources
       *       ↓
       * /reader/[id]
       *
       * Return to Resources.
       */
      const fromResources =
        sessionStorage.getItem(
          'eggpuff_reader_from_resources'
        ) === 'true'

      if (fromResources) {
        sessionStorage.removeItem(
          'eggpuff_reader_from_resources'
        )

        router.back()
        return
      }
    }

    /*
     * Reader was opened directly.
     *
     * There is no valid EggPuff page in the
     * navigation chain to return to.
     *
     * Replace instead of push so we do NOT create:
     *
     * Reader → Resources → Reader
     *
     * in browser history.
     *
     * Resources will then handle:
     *
     * Resources → Feed
     *
     * and consume the direct-entry flag.
     */
    router.replace('/resources')
  }

  setTopBar({
    title: resource.title,

    showBack: true,

    onBack: handleBack,

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

  return () => {
    setTopBar({})
  }
}, [
  resource,
  router,
  setTopBar,
  downloadCount,
  notify,
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
        downloads_count: downloadCount,
      }}
      onPagesChange={setPages}
    />

    <ResourceInfoSheet
      open={infoOpen}
      onClose={() => setInfoOpen(false)}
      resource={{
        title: resource.title,

        description: resource.description,

        file_name: resource.file_name,

        file_type: resource.file_type,

        file_size: resource.file_size,

        downloads_count: downloadCount,

        created_at: resource.created_at,

        pages,

        uploader_name: resource.uploader_name,

        college_name: resource.college_name,
      }}
    />
  </>
)
}