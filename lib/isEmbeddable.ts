const NON_EMBEDDABLE_DOMAINS = [
  'instagram.com',
  'facebook.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
  'threads.net',
]

export function isEmbeddable(url: string) {
  try {
    const hostname = new URL(url)
      .hostname
      .replace(/^www\./, '')
      .toLowerCase()

    return !NON_EMBEDDABLE_DOMAINS.some(domain =>
      hostname.includes(domain)
    )
  } catch {
    return false
  }
}