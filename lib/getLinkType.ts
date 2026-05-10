export type LinkType =
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'spotify'
  | 'website'

export function getLinkType(
  url: string
): LinkType {
  const lower = url.toLowerCase()

  // 📸 Instagram
  if (lower.includes('instagram.com')) {
    return 'instagram'
  }

  // ▶️ YouTube
  if (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be')
  ) {
    return 'youtube'
  }

  // 🐦 Twitter / X
  if (
    lower.includes('twitter.com') ||
    lower.includes('x.com')
  ) {
    return 'twitter'
  }

  // 🎵 Spotify
  if (lower.includes('spotify.com')) {
    return 'spotify'
  }

  // 🌐 Everything else
  return 'website'
}