'use client'

import { useEffect, useState } from 'react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  if (!prompt) return null

  return (
    <button
      onClick={install}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#F4B860',
        borderRadius: 999,
        padding: '10px 16px',
        fontWeight: 600
      }}
    >
      Install EggPuff
    </button>
  )
}