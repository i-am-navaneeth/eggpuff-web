'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY =
  'eggpuff_august15_celebration_shown'

const LETTERS = [
  {
    letter: 'I',
    left: '5%',
    delay: '0.00s',
    duration: '1.55s',
    rotate: '-8deg',
    color: '#FF9933',
  },
  {
    letter: 'N',
    left: '12%',
    delay: '0.08s',
    duration: '1.5s',
    rotate: '7deg',
    color: '#FF9933',
  },
  {
    letter: 'D',
    left: '19%',
    delay: '0.16s',
    duration: '1.6s',
    rotate: '-5deg',
    color: '#FFFFFF',
  },
  {
    letter: 'E',
    left: '26%',
    delay: '0.24s',
    duration: '1.5s',
    rotate: '8deg',
    color: '#138808',
  },
  {
    letter: 'P',
    left: '33%',
    delay: '0.05s',
    duration: '1.65s',
    rotate: '-6deg',
    color: '#FF9933',
  },
  {
    letter: 'E',
    left: '40%',
    delay: '0.20s',
    duration: '1.55s',
    rotate: '6deg',
    color: '#FFFFFF',
  },
  {
    letter: 'N',
    left: '47%',
    delay: '0.10s',
    duration: '1.65s',
    rotate: '-7deg',
    color: '#138808',
  },
  {
    letter: 'D',
    left: '54%',
    delay: '0.28s',
    duration: '1.55s',
    rotate: '5deg',
    color: '#FF9933',
  },
  {
    letter: 'E',
    left: '61%',
    delay: '0.04s',
    duration: '1.6s',
    rotate: '-6deg',
    color: '#FFFFFF',
  },
  {
    letter: 'N',
    left: '68%',
    delay: '0.18s',
    duration: '1.5s',
    rotate: '7deg',
    color: '#138808',
  },
  {
    letter: 'C',
    left: '75%',
    delay: '0.12s',
    duration: '1.65s',
    rotate: '-5deg',
    color: '#FF9933',
  },
  {
    letter: 'E',
    left: '82%',
    delay: '0.26s',
    duration: '1.55s',
    rotate: '8deg',
    color: '#138808',
  },
  {
    letter: 'D',
    left: '89%',
    delay: '0.06s',
    duration: '1.6s',
    rotate: '-7deg',
    color: '#FFFFFF',
  },
  {
    letter: 'A',
    left: '43%',
    delay: '0.34s',
    duration: '1.5s',
    rotate: '6deg',
    color: '#FF9933',
  },
  {
    letter: 'Y',
    left: '57%',
    delay: '0.40s',
    duration: '1.55s',
    rotate: '-6deg',
    color: '#138808',
  },
]

const CHAKRA_BLUE = '#000080'

const chakraStyle = {
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: `2px solid ${CHAKRA_BLUE}`,
  background:
    `repeating-conic-gradient(
      from 0deg,
      ${CHAKRA_BLUE} 0deg 3deg,
      transparent 3deg 15deg
    )`,
  boxSizing: 'border-box' as const,
  position: 'relative' as const,
  flexShrink: 0,
}

export default function August15Celebration() {
  const [visible, setVisible] =
    useState(false)

useEffect(() => {
  /*
   * ================= TEST MODE =================
   *
   * Set this to true while developing to preview
   * the August 15 celebration immediately.
   *
   * IMPORTANT:
   * Change this back to false before production.
   */
  const TEST_MODE = false

  const today = new Date()

  const isAugust15 =
    today.getMonth() === 7 &&
    today.getDate() === 15

  /*
   * Normal production behavior:
   * only run on August 15.
   */
  if (!TEST_MODE && !isAugust15) {
    return
  }

    /*
   * Show the celebration every time
   * the app is opened or refreshed
   * on August 15.
   */
  setVisible(true)

  /*
   * Remove the celebration after
   * the complete animation.
   */
  const timer = window.setTimeout(() => {
    setVisible(false)
  }, 3000)

  return () => {
    window.clearTimeout(timer)
  }
}, [])

  if (!visible) {
    return null
  }

  return (
  <>
    {/* ================= AUGUST 15 CELEBRATION ================= */}

    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,

        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',

        overflow: 'hidden',

        pointerEvents: 'none',

        background:
          'rgba(255,255,255,0.72)',

        backdropFilter:
          'blur(3px)',

        WebkitBackdropFilter:
          'blur(3px)',

        animation:
          'aug15OverlayIn 0.35s ease-out both',
      }}
    >

      {/* ================= FALLING INDE ================= */}

      <div
        style={{
          position: 'absolute',
          inset: 0,

          overflow: 'hidden',

          zIndex: 1,
        }}
      >
        {LETTERS.map(
  (
    {
      letter,
      left,
      delay,
      duration,
      rotate,
      color,
    },
    index
  ) => (
    <div
      key={`${letter}-${index}`}
      style={{
        position: 'absolute',

        top: 0,
        left,

        fontSize:
          'clamp(54px, 14vw, 110px)',

        fontWeight: 900,

        lineHeight: 1,

        color,

        WebkitTextStroke:
          '1.5px currentColor',

        textShadow:
          '0 8px 24px rgba(15,23,42,0.08)',

        transform:
          `rotate(${rotate})`,

        animation:
          `aug15LetterFall ${duration} cubic-bezier(.2,.8,.25,1) ${delay} both`,
      }}
    >
      {letter}
    </div>
  )
)}
      </div>


      {/* ================= 80th ================= */}

      <div
        style={{
          position: 'absolute',

          top: '7%',

          left: 0,
          right: 0,

          zIndex: 4,

          display: 'flex',
          justifyContent: 'center',

          pointerEvents: 'none',

          animation:
            'aug1580thIn 1.55s cubic-bezier(.22,1,.36,1) 0.25s both',
        }}
      >
        <div
  style={{
    position: 'relative',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize:
      'clamp(64px, 19vw, 130px)',

    lineHeight: 0.9,

    fontWeight: 900,

    letterSpacing: '-4px',

    textAlign: 'center',

    background:
      'linear-gradient(180deg, #FF9933 0%, #FF9933 38%, #FFFFFF 38%, #FFFFFF 62%, #138808 62%, #138808 100%)',

    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',

    filter:
      'drop-shadow(0 8px 20px rgba(0,0,128,0.10))',
  }}
>
  80th

  {/* ASHOKA CHAKRA */}
  <span
    aria-hidden="true"
    style={{
      position: 'absolute',

      left: '50%',
      top: '50%',

      width: 'clamp(28px, 7vw, 44px)',
      height: 'clamp(28px, 7vw, 44px)',

      transform:
        'translate(-50%, -50%)',

      borderRadius: '50%',

      border:
        '2px solid #000080',

      background:
        'repeating-conic-gradient(from 0deg, #000080 0deg 3deg, transparent 3deg 15deg)',

      opacity: 0.95,

      pointerEvents: 'none',
    }}
  />

  {/* CHAKRA CENTER */}
  <span
    aria-hidden="true"
    style={{
      position: 'absolute',

      left: '50%',
      top: '50%',

      width: 5,
      height: 5,

      transform:
        'translate(-50%, -50%)',

      borderRadius: '50%',

      background:
        '#000080',

      pointerEvents: 'none',
    }}
  />
</div>
      </div>


      {/* ================= STUDENT ILLUSTRATION ================= */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          bottom: '-2px',

          width:
            'min(760px, 112vw)',

          transform:
            'translateX(-50%) translateY(100%)',

          zIndex: 2,

          animation:
            'aug15ImageRise 1.15s cubic-bezier(.22,.8,.24,1) 0.05s forwards',
        }}
      >
        <img
          src="/IN_CAMP_PIC_EP.png"
          alt=""
          draggable={false}
          style={{
            display: 'block',

            width: '100%',
            height: 'auto',

            userSelect: 'none',

            pointerEvents: 'none',

            objectFit: 'contain',
          }}
        />
      </div>


      {/* ================= INDEPENDENCE DAY ================= */}

      <div
        style={{
          position: 'absolute',

          left: 0,
          right: 0,

          bottom:
            '23%',

          zIndex: 5,

          display: 'flex',
          justifyContent: 'center',

          padding:
            '0 18px',

          textAlign: 'center',

          pointerEvents: 'none',

          animation:
            'aug15TitleIn 0.9s cubic-bezier(.22,1,.36,1) 1.45s both',
        }}
      >
        <div
          style={{
            fontSize:
              'clamp(20px, 6vw, 38px)',

            lineHeight: 1.1,

            fontWeight: 900,

            letterSpacing:
              '0.5px',

            whiteSpace: 'nowrap',

            background:
  'linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%)',

            WebkitBackgroundClip:
              'text',

            WebkitTextFillColor:
              'transparent',

            filter:
              'drop-shadow(0 5px 12px rgba(255,255,255,0.9))',
          }}
        >
          INDEPENDENCE DAY
        </div>
      </div>


      {/* ================= SUBTLE TRICOLOR LINE ================= */}

      <div
        style={{
          position: 'absolute',

          bottom: 0,
          left: 0,
          right: 0,

          height: 4,

          zIndex: 6,

          background:
  'linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%)',

          opacity: 0,

          animation:
            'aug15BottomLine 0.5s ease-out 1.55s forwards',
        }}
      />
    </div>


    {/* ================= ANIMATION STYLES ================= */}

    <style jsx>{`

      @keyframes aug15OverlayIn {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }


      /* ================= STUDENTS RISE ================= */

      @keyframes aug15ImageRise {

        0% {
          transform:
            translateX(-50%)
            translateY(100%);
        }

        70% {
          transform:
            translateX(-50%)
            translateY(-4%);
        }

        100% {
          transform:
            translateX(-50%)
            translateY(0);
        }
      }


      /* ================= LETTERS FALL ================= */

      @keyframes aug15LetterFall {

        0% {
          opacity: 0;

          transform:
            translateY(-110vh)
            rotate(-12deg);
        }

        12% {
          opacity: 1;
        }

        62% {
          opacity: 1;
        }

        72% {
          opacity: 0;
        }

        100% {
          opacity: 0;

          transform:
            translateY(60vh)
            rotate(8deg);
        }
      }


      /* ================= 80TH ================= */

      @keyframes aug1580thIn {

        0% {
          opacity: 0;

          transform:
            translateY(-35px)
            scale(0.72);
        }

        55% {
          opacity: 1;

          transform:
            translateY(4px)
            scale(1.04);
        }

        100% {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }


      /* ================= INDEPENDENCE DAY ================= */

      @keyframes aug15TitleIn {

        0% {
          opacity: 0;

          transform:
            translateY(22px)
            scale(0.92);
        }

        70% {
          opacity: 1;

          transform:
            translateY(-2px)
            scale(1.02);
        }

        100% {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }


      /* ================= BOTTOM LINE ================= */

      @keyframes aug15BottomLine {

        from {
          opacity: 0;
        }

        to {
          opacity: 0.9;
        }
      }


      /* ================= REDUCED MOTION ================= */

      @media (prefers-reduced-motion: reduce) {

        @keyframes aug15ImageRise {

          from {
            transform:
              translateX(-50%)
              translateY(0);
          }

          to {
            transform:
              translateX(-50%)
              translateY(0);
          }
        }

        @keyframes aug15LetterFall {

          from {
            opacity: 0;
          }

          to {
            opacity: 0;
          }
        }

        @keyframes aug15OverlayIn {

          from {
            opacity: 1;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes aug1580thIn {

          from {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes aug15TitleIn {

          from {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }
      }

    `}</style>
  </>
)
}