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

const BALLOONS = [
  {
    left: '4%',
    top: '17%',
    side: 'left',
    delay: '1.65s',
    duration: '1.15s',
    size: 30,
    color: '#FF9933',
    rotate: '-8deg',
  },
  {
    left: '84%',
    top: '17%',
    side: 'right',
    delay: '1.8s',
    duration: '1.2s',
    size: 28,
    color: '#138808',
    rotate: '7deg',
  },
  {
    left: '1%',
    top: '33%',
    side: 'left',
    delay: '1.95s',
    duration: '1.25s',
    size: 24,
    color: '#FFFFFF',
    rotate: '6deg',
  },
  {
    left: '89%',
    top: '33%',
    side: 'right',
    delay: '2.05s',
    duration: '1.3s',
    size: 26,
    color: '#FF9933',
    rotate: '-6deg',
  },
  {
    left: '10%',
    top: '39%',
    side: 'left',
    delay: '2.15s',
    duration: '1.35s',
    size: 20,
    color: '#138808',
    rotate: '-4deg',
  },
  {
    left: '82%',
    top: '39%',
    side: 'right',
    delay: '2.25s',
    duration: '1.4s',
    size: 19,
    color: '#FFFFFF',
    rotate: '5deg',
  },
]

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

  /*
   * ================= AUGUST 15 ACTIVE WINDOW =================
   *
   * Celebration is available:
   *
   * August 14 12:00 AM
   * through
   * August 16 11:59 PM
   *
   * It automatically stops at:
   *
   * August 17 12:00 AM
   */

  const year = today.getFullYear()

  const celebrationStart =
    new Date(year, 7, 14, 0, 0, 0, 0)

  const celebrationEnd =
    new Date(year, 7, 17, 0, 0, 0, 0)

  const isAugust15CelebrationWindow =
    today >= celebrationStart &&
    today < celebrationEnd

  /*
   * Normal production behavior:
   * only show the celebration during
   * August 14, August 15, and August 16.
   */
  if (
    !TEST_MODE &&
    !isAugust15CelebrationWindow
  ) {
    return
  }

  /*
   * Show the celebration every time
   * the app is opened or refreshed
   * during the celebration window.
   */
  setVisible(true)

  /*
   * Remove the celebration after
   * the complete animation.
   */
  const timer = window.setTimeout(() => {
    setVisible(false)
  }, 4000)

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

      {/* ================= FALLING INDE + RISING BALLOONS ================= */}

<div
  style={{
    position: 'absolute',
    inset: 0,

    overflow: 'hidden',

    zIndex: 3,

    pointerEvents: 'none',
  }}
>
  {/* ================= FALLING INDE LETTERS ================= */}

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
        key={`letter-${letter}-${index}`}
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

  {/* ================= TRICOLOR BALLOONS ================= */}

  {BALLOONS.map((balloon, index) => (
    <div
  key={`balloon-${index}`}
  style={{
    position: 'absolute',

    left: balloon.left,
    top: balloon.top,

    width: balloon.size,
    height: balloon.size * 1.18,

    opacity: 0,

    transform:
      `rotate(${balloon.rotate})`,

    animation:
      `${balloon.side === 'left'
        ? 'aug15BalloonFromLeft'
        : 'aug15BalloonFromRight'
      } ${balloon.duration} cubic-bezier(.22,.8,.24,1) ${balloon.delay} forwards`,

    filter:
      'drop-shadow(0 5px 10px rgba(15,23,42,0.12))',
  }}
>
      {/* BALLOON */}

      <div
        style={{
          position: 'absolute',

          top: 0,
          left: 0,

          width: '100%',
          height: '84%',

          borderRadius:
            '50% 50% 46% 46%',

          background:
            `radial-gradient(
              circle at 32% 25%,
              rgba(255,255,255,0.8) 0 8%,
              transparent 9%
            ),
            ${balloon.color}`,

          boxShadow:
            'inset -4px -6px 10px rgba(0,0,0,0.10)',

          border:
            '1px solid rgba(15,23,42,0.08)',
        }}
      />

      {/* BALLOON KNOT */}

      <div
        style={{
          position: 'absolute',

          top: '80%',

          left: '50%',

          width: 6,
          height: 6,

          transform:
            'translateX(-50%) rotate(45deg)',

          background:
            balloon.color,

          borderRadius: 1,
        }}
      />

      {/* BALLOON STRING */}

      <div
        style={{
          position: 'absolute',

          top: '84%',

          left: '50%',

          width: 1,

          height: balloon.size * 1.7,

          transform:
            'translateX(-50%)',

          background:
            'rgba(15,23,42,0.28)',

          transformOrigin:
            'top center',
        }}
      />
    </div>
  ))}
</div>


     {/* ================= 80th + INDEPENDENCE DAY ================= */}

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
  }}
>
  {/* ================= 80th ================= */}

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

      WebkitBackgroundClip:
        'text',

      WebkitTextFillColor:
        'transparent',

      filter:
        'drop-shadow(0 8px 20px rgba(0,0,128,0.10))',

      animation:
        'aug1580thIn 1.55s cubic-bezier(.22,1,.36,1) 0.25s both',
    }}
  >
    80th
  </div>


  {/* ================= INDEPENDENCE DAY ================= */}

  <div
    style={{
      position: 'absolute',

      left: '50%',
      top: '50%',

      transform:
        'translate(-50%, -50%)',

      width: 'max-content',

      fontSize:
        'clamp(10px, 3.2vw, 19px)',

      lineHeight: 1,

      fontWeight: 950,

      letterSpacing:
        '0.6px',

      whiteSpace:
        'nowrap',

      color:
        '#000080',

      WebkitTextFillColor:
        '#000080',

      WebkitTextStroke:
        '0.25px #000080',

      textShadow:
        '0 1px 2px rgba(255,255,255,0.95)',

      opacity: 0,

      zIndex: 10,

      animation:
        'aug15MiddleTitleIn 1.1s cubic-bezier(.22,1,.36,1) 1.85s forwards',
    }}
  >
    INDEPENDENCE DAY
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

      /* ================= INDEPENDENCE DAY ================= */

@keyframes aug15MiddleTitleIn {

  /* Hidden while 80th is entering */
  0% {
    opacity: 0;

    transform:
      translate(-50%, -50%)
      scale(0.82);
  }

  /* Pop into the middle */
  45% {
    opacity: 1;

    transform:
      translate(-50%, -50%)
      scale(1.06);
  }

  /* Settle */
  70% {
    opacity: 1;

    transform:
      translate(-50%, -50%)
      scale(1);
  }

  /* Stay visible — NO FADE OUT */
  100% {
    opacity: 1;

    transform:
      translate(-50%, -50%)
      scale(1);
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

      /* ================= SIDE BALLOONS ================= */

@keyframes aug15BalloonFromLeft {

  0% {
    opacity: 0;

    transform:
      translateX(-120px)
      translateY(8px)
      rotate(-14deg)
      scale(0.72);
  }

  20% {
    opacity: 1;
  }

  65% {
    transform:
      translateX(8px)
      translateY(-3px)
      rotate(5deg)
      scale(1.02);
  }

  82% {
    transform:
      translateX(-3px)
      translateY(2px)
      rotate(-2deg)
      scale(0.99);
  }

  100% {
    opacity: 0.95;

    transform:
      translateX(0)
      translateY(0)
      rotate(0deg)
      scale(1);
  }
}


@keyframes aug15BalloonFromRight {

  0% {
    opacity: 0;

    transform:
      translateX(120px)
      translateY(8px)
      rotate(14deg)
      scale(0.72);
  }

  20% {
    opacity: 1;
  }

  65% {
    transform:
      translateX(-8px)
      translateY(-3px)
      rotate(-5deg)
      scale(1.02);
  }

  82% {
    transform:
      translateX(3px)
      translateY(2px)
      rotate(2deg)
      scale(0.99);
  }

  100% {
    opacity: 0.95;

    transform:
      translateX(0)
      translateY(0)
      rotate(0deg)
      scale(1);
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