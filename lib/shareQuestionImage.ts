import { toBlob } from 'html-to-image'

export async function shareQuestionImage(
  element: HTMLElement
) {
  const blob =
    await toBlob(element)

  if (!blob) return

  const file = new File(
    [blob],
    'eggpuff-question.png',
    {
      type: 'image/png',
    }
  )

  if (
    navigator.canShare?.({
      files: [file],
    })
  ) {
    await navigator.share({
      files: [file],
      title: 'EggPuff',
    })

    return
  }

  // fallback download

  const url =
    URL.createObjectURL(blob)

  const a =
    document.createElement('a')

  a.href = url

  a.download =
    'eggpuff-question.png'

  a.click()

  URL.revokeObjectURL(url)
}