export function extractUrl(
  text: string
): string | null {
  if (!text) return null

  // 🔥 detects:
  // https://example.com
  // http://example.com
  // example.com
  // www.example.com

  const regex =
    /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi

  const matches = text.match(regex)

  if (!matches || matches.length === 0) {
    return null
  }

  let url = matches[0].trim()

  // 🔥 remove trailing punctuation
  url = url.replace(/[),.!?]+$/, '')

  // 🔥 auto-add protocol
  if (
    !url.startsWith('http://') &&
    !url.startsWith('https://')
  ) {
    url = `https://${url}`
  }

  return url
}