// Validation.ts

export const TITLE_MAX_LENGTH = 80
export const BODY_MAX_LENGTH = 500
export const LINK_MAX_LENGTH = 500

export type ValidationResult = {
  valid: boolean
  errors: {
    title?: string
    body?: string
    link?: string
  }
}

const urlRegex =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i

export function validateTitle(
  title: string
): string | undefined {
  const value = title.trim()

  if (!value) {
    return 'Title is required.'
  }

  if (value.length > TITLE_MAX_LENGTH) {
    return `Title must be ${TITLE_MAX_LENGTH} characters or less.`
  }

  return undefined
}

export function validateBody(
  body: string
): string | undefined {
  const value = body.trim()

  if (!value) {
    return 'Body is required.'
  }

  if (value.length > BODY_MAX_LENGTH) {
    return `Body must be ${BODY_MAX_LENGTH} characters or less.`
  }

  return undefined
}

export function validateLink(
  link: string
): string |undefined {
  const value = link.trim()

  if (!value) {
    return undefined
  }

  if (value.length > LINK_MAX_LENGTH) {
    return `Link must be ${LINK_MAX_LENGTH} characters or less.`
  }

  // Internal EggPuff routes
  if (value.startsWith('/')) {
    return undefined
  }

  // External URL
  if (urlRegex.test(value)) {
    return undefined
  }

  return 'Enter a valid URL or internal route.'
}

export function validateNotification(
  title: string,
  body: string,
  link: string
): ValidationResult {
  const errors = {
    title: validateTitle(title),
    body: validateBody(body),
    link: validateLink(link),
  }

  return {
    valid:
      !errors.title &&
      !errors.body &&
      !errors.link,

    errors,
  }
}

export function canSaveDraft(
  title: string,
  body: string
) {
  return (
    title.trim().length > 0 ||
    body.trim().length > 0
  )
}

export function remainingCharacters(
  value: string,
  max: number
) {
  return max - value.length
}

export function bodyWordCount(
  text: string
) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export function bodyCharacterCount(
  text: string
) {
  return text.length
}