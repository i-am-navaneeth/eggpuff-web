'use client'

import {
  useRef,
  useState,
} from 'react'

export default function usePointerZoom() {
  const MIN_SCALE = 1
  const MAX_SCALE = 4

  const [scale, setScale] =
    useState(1)

  const [offset, setOffset] =
    useState({
      x: 0,
      y: 0,
    })

  const pointers =
    useRef(
      new Map<
        number,
        {
          x: number
          y: number
        }
      >()
    )

  const lastDistance =
    useRef<number | null>(null)

  const lastCenter =
    useRef<{
      x: number
      y: number
    } | null>(null)

  const clamp = (
    value: number
  ) =>
    Math.min(
      MAX_SCALE,
      Math.max(
        MIN_SCALE,
        value
      )
    )

  const getDistance = () => {
    const pts = Array.from(
      pointers.current.values()
    )

    if (pts.length < 2)
      return null

    return Math.hypot(
      pts[0].x - pts[1].x,
      pts[0].y - pts[1].y
    )
  }

  const getCenter = () => {
    const pts = Array.from(
      pointers.current.values()
    )

    if (pts.length < 2)
      return null

    return {
      x:
        (pts[0].x + pts[1].x) /
        2,

      y:
        (pts[0].y + pts[1].y) /
        2,
    }
  }

  const onPointerDown = (
    e: React.PointerEvent
  ) => {
    ;(
      e.target as HTMLElement
    ).setPointerCapture(
      e.pointerId
    )

    pointers.current.set(
      e.pointerId,
      {
        x: e.clientX,
        y: e.clientY,
      }
    )
  }

  const onPointerMove = (
    e: React.PointerEvent
  ) => {
    if (
      !pointers.current.has(
        e.pointerId
      )
    )
      return

    pointers.current.set(
      e.pointerId,
      {
        x: e.clientX,
        y: e.clientY,
      }
    )

    if (
      pointers.current.size === 2
    ) {
      const distance =
        getDistance()

      const center =
        getCenter()

      if (
        distance &&
        lastDistance.current
      ) {
        const ratio =
          distance /
          lastDistance.current

        setScale((prev) =>
          clamp(prev * ratio)
        )
      }

      lastDistance.current =
        distance

      lastCenter.current =
        center
    }

    if (
      pointers.current.size === 1 &&
      scale > 1
    ) {
      const prev =
        lastCenter.current

      if (prev) {
        setOffset((old) => ({
          x:
            old.x +
            (e.clientX -
              prev.x),

          y:
            old.y +
            (e.clientY -
              prev.y),
        }))
      }

      lastCenter.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
  }

  const onPointerUp = (
    e: React.PointerEvent
  ) => {
    pointers.current.delete(
      e.pointerId
    )

    lastDistance.current =
      null

    if (
      pointers.current.size === 0
    ) {
      lastCenter.current =
        null
    }
  }

  const reset = () => {
    setScale(1)

    setOffset({
      x: 0,
      y: 0,
    })
  }

  return {
    scale,

    offset,

    reset,

    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel:
        onPointerUp,
      onPointerLeave:
        onPointerUp,
    },
  }
}