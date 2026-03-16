export function saveScore(score: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ep_live_score", JSON.stringify(score))
  }
}

export function loadScore() {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("ep_live_score")
    if (cached) return JSON.parse(cached)
  }
  return null
}