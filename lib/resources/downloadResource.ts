import { supabase } from '@/lib/supabase'

export async function downloadResource(
  resourceId: string,
  fileUrl: string,
  fileName?: string
) {
  // Fire-and-forget analytics
const { data, error } =
  await supabase.rpc(
    'increment_resource_downloads',
    {
      resource_id: resourceId,
    }
  )

console.log({
  affected: data,
  error,
})

const response = await fetch(fileUrl)

if (!response.ok) {
  throw new Error('Failed to download file')
}

const blob = await response.blob()

const blobUrl = URL.createObjectURL(blob)

const link = document.createElement('a')

link.href = blobUrl

link.download =
  fileName ||
  'resource.pdf'

link.style.display = 'none'

document.body.appendChild(link)

link.click()

document.body.removeChild(link)

// Wait before revoking so the browser
// has time to start the download.
setTimeout(() => {
  URL.revokeObjectURL(blobUrl)
}, 1000)
}