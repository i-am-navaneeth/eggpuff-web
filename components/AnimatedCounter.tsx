'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  duration?: number
  fontSize?: number | string
  fontWeight?: number | string
  color?: string
  minWidth?: number
}

export default function AnimatedCounter({
  value,
  duration = 180,
  fontSize = 'inherit',
  fontWeight = 'inherit',
  color = 'inherit',
  minWidth = 18,
}: Props) {
  const previous = useRef(value)

  const [current, setCurrent] = useState(value)
  const [next, setNext] = useState(value)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down'>('up')

  useEffect(() => {
    if (value === previous.current) return

    setDirection(value > previous.current ? 'up' : 'down')

    setCurrent(previous.current)
    setNext(value)

    setAnimating(true)

    const t = setTimeout(() => {
      previous.current = value
      setCurrent(value)
      setAnimating(false)
    }, duration)

    return () => clearTimeout(t)
  }, [value, duration])

  return (
    <>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: '1.2em',
          minWidth,
          display: 'inline-block',
          lineHeight: '1.2em',
        }}
      >
        {/* Current */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            fontSize,
            fontWeight,
            color,

            transform: animating
              ? direction === 'up'
                ? 'translateY(-100%)'
                : 'translateY(100%)'
              : 'translateY(0)',

            transition: `transform ${duration}ms cubic-bezier(.25,.8,.25,1)`,
          }}
        >
          {current}
        </span>

        {/* Incoming */}
        {animating && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              fontSize,
              fontWeight,
              color,

              transform:
                direction === 'up'
                  ? 'translateY(100%)'
                  : 'translateY(-100%)',

              animation:
                direction === 'up'
                  ? `counterUp ${duration}ms forwards`
                  : `counterDown ${duration}ms forwards`,
            }}
          >
            {next}
          </span>
        )}
      </div>

      <style jsx>{`
        @keyframes counterUp {
          to {
            transform: translateY(0%);
          }
        }

        @keyframes counterDown {
          to {
            transform: translateY(0%);
          }
        }
      `}</style>
    </>
  )
}