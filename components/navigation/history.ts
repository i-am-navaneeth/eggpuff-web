/* ==========================================================
   EggPuff Navigation History
   ----------------------------------------------------------
   Browser history adapter.

   Responsibilities:
   - Push browser history
   - Replace browser history
   - Go back
   - Listen for popstate

   No React.
   No navigation state.
   No stack logic.
========================================================== */

export type HistoryListener = (
  url: string
) => void

/* ==========================================================
   PUSH
========================================================== */

export function pushHistory(
  url: string
) {
  if (typeof window === 'undefined') {
    return
  }

  window.history.pushState(
    null,
    '',
    url
  )
}

/* ==========================================================
   REPLACE
========================================================== */

export function replaceHistory(
  url: string
) {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState(
    null,
    '',
    url
  )
}

/* ==========================================================
   BACK
========================================================== */

export function backHistory() {
  if (typeof window === 'undefined') {
    return
  }

  window.history.back()
}

/* ==========================================================
   CURRENT URL
========================================================== */

export function currentUrl() {
  if (typeof window === 'undefined') {
    return ''
  }

  return (
    window.location.pathname +
    window.location.search +
    window.location.hash
  )
}

/* ==========================================================
   POPSTATE
========================================================== */

export function subscribeHistory(
  listener: HistoryListener
) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handlePopState = () => {
    listener(currentUrl())
  }

  window.addEventListener(
    'popstate',
    handlePopState
  )

  return () => {
    window.removeEventListener(
      'popstate',
      handlePopState
    )
  }
}