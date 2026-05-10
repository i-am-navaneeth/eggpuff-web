export function highlightLinks(
  text: string
) {
  const regex =
    /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi

  return text.replace(
    regex,
    (match) => {
      return `<span class="link-highlight">${match}</span>`
    }
  )
}