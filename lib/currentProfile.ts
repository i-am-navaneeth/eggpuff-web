type CurrentProfile = {
  user_id: string
  username: string
  name: string
  avatar_url: string
} | null

let profile: CurrentProfile = null

const listeners = new Set<() => void>()

export function getCurrentProfile() {
  return profile
}

export function setCurrentProfile(
  value: CurrentProfile
) {
  profile = value

  listeners.forEach((listener) => listener())
}

export function subscribeCurrentProfile(
  listener: () => void
) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}