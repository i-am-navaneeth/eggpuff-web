export const getSeen = () => {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('seen_questions') || '[]')
}

export const markSeen = (id: string) => {
  const seen = getSeen()
  if (!seen.includes(id)) {
    localStorage.setItem(
      'seen_questions',
      JSON.stringify([...seen, id])
    )
  }
}