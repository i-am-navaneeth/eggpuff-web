const BLOCKED_DOMAINS = [
  'pornhub.com',
  'xvideos.com',
  'xnxx.com',
  'redtube.com',
  'youporn.com',
  'onlyfans.com',
  'stripchat.com',
  'chaturbate.com',
]

export function isBlockedDomain(
  url: string
) {
  try {
    const hostname = new URL(url)
      .hostname
      .replace('www.', '')
      .toLowerCase()

    return BLOCKED_DOMAINS.some(domain =>
      hostname.includes(domain)
    )
  } catch {
    return true
  }
}