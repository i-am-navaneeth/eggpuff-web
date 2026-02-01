'use client'

import '../style.css'
import { useEffect } from 'react'

export default function MawaPage() {
  useEffect(() => {
    const mediaList = [
      { type: 'video', src: '/valentinesday-special/media/mawa-video.mp4' },
      { type: 'image', src: '/valentinesday-special/media/mawa-pic.jpeg' },
    ]

    const container = document.getElementById('media-container')
    if (!container) return

    container.innerHTML = ''

    const chosen = mediaList[Math.floor(Math.random() * mediaList.length)]
    let el: HTMLElement

   if (chosen.type === 'video') {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'relative'
  wrapper.style.display = 'inline-block'

  const v = document.createElement('video')
  v.src = chosen.src
  v.autoplay = true
  v.muted = true
  v.loop = true
  v.playsInline = true
  v.className = 'media'

  const icon = document.createElement('div')
  icon.innerText = '🔊'
  icon.style.position = 'absolute'
  icon.style.bottom = '12px'
  icon.style.right = '12px'
  icon.style.fontSize = '22px'
  icon.style.background = 'rgba(0,0,0,0.55)'
  icon.style.borderRadius = '50%'
  icon.style.padding = '6px'
  icon.style.cursor = 'pointer'

  wrapper.appendChild(v)
  wrapper.appendChild(icon)

  const enableSound = () => {
    v.muted = false
    v.play()
    icon.remove()
  }

  wrapper.addEventListener('click', enableSound)

  el = wrapper
    } else {
      const img = document.createElement('img')
      img.src = chosen.src
      img.className = 'media'
      el = img
    }

    container.appendChild(el)
  }, [])

  return (
    <div className="container">
      <div id="media-container"></div>

      <div className="text">
        Single ante takkuva kaadu.<br />
        You’re still seen.
      </div>

      <button
        className="cta"
        onClick={() => (window.location.href = 'https://eggpuff.in')}
      >
        Come to EggPuff 🥐
      </button>
    </div>
  )
}
