'use client'

import React from 'react'
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

import StoryShareCard from './StoryShareCard'

type Props = {
  question: string
  creator: string
  username: string
  helpfulCount: number
  answersCount: number
}

export default function StoryVideo({
  question,
  creator,
  username,
  helpfulCount,
  answersCount,
}: Props) {
  const frame = useCurrentFrame()

  const { fps } =
    useVideoConfig()

  const scale = spring({
    frame,
    fps,

    config: {
      damping: 18,
      stiffness: 100,
    },
  })

  const opacity =
    interpolate(
      frame,
      [0, 20],
      [0, 1],
      {
        extrapolateLeft:
          'clamp',

        extrapolateRight:
          'clamp',
      }
    )

  const floatY =
    Math.sin(frame / 25) * 8

  const footerOpacity =
    interpolate(
      frame,
      [40, 65],
      [0, 1],
      {
        extrapolateLeft:
          'clamp',

        extrapolateRight:
          'clamp',
      }
    )

  return (
    <AbsoluteFill
      style={{
        background:
          '#ffffff',
      }}
    >
      {/* CARD */}

      <div
        style={{
          width: '100%',
          height: '100%',

          display: 'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          transform: `
            translateY(${floatY}px)
            scale(${0.92 + scale * 0.08})
          `,

          opacity,
        }}
      >
        <StoryShareCard
          question={question}
          creator={creator}
          username={username}
          helpfulCount={
            helpfulCount
          }
          answersCount={
            answersCount
          }
        />
      </div>

      {/* FOOTER FADE */}

      <div
        style={{
          position:
            'absolute',

          bottom: 70,

          width: '100%',

          textAlign:
            'center',

          fontSize: 36,

          fontWeight: 700,

          color: '#94A3B8',

          opacity:
            footerOpacity,
        }}
      >
        Asked on EggPuff
      </div>
    </AbsoluteFill>
  )
}