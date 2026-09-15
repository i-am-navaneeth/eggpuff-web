'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type BrickCell = {
  row: number
  column: number
}

type FallingPiece = {
  letterIndex: number
  letter: string
  cells: BrickCell[]
  x: number
  targetY: number
  spawnY: number
}

type PieceRuntime = {
  y: number
  velocity: number
  settled: boolean
  bounce: number
  active: boolean
}

type PopperPiece = {
  x: number
  y: number
  rotation: number
  delay: number
  color: string
  width: number
  height: number
}

/*
 * =============================================================
 * EXPLORE LETTER SHAPES
 * =============================================================
 *
 * 5 × 7 grid.
 *
 * The split is horizontal:
 *
 *       FALLING
 *
 *       █████
 *       █
 *       ████
 *
 *       ─────
 *
 *       █
 *       █
 *       █
 *       █████
 *
 *       ALREADY BUILT
 *
 * The bottom four rows are already constructed.
 * The top three rows arrive as one rigid falling piece.
 */

const LETTERS: Record<string, string[]> = {
  E: [
    '11111',
    '10000',
    '11110',
    '10000',
    '10000',
    '10000',
    '11111',
  ],

  X: [
    '10001',
    '10001',
    '01010',
    '00100',
    '01010',
    '10001',
    '10001',
  ],

  P: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10000',
    '10000',
    '10000',
  ],

  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111',
  ],

  O: [
    '01110',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01110',
  ],

  R: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10100',
    '10010',
    '10001',
  ],
}

const WORD = ['E', 'X', 'P', 'L', 'O', 'R', 'E']

/*
 * =============================================================
 * GRID
 * =============================================================
 */

const BRICK_SIZE = 17
const BRICK_GAP = 2.5
const CELL = BRICK_SIZE + BRICK_GAP

const LETTER_COLUMNS = 5
const LETTER_ROWS = 7

const LETTER_WIDTH =
  LETTER_COLUMNS * CELL

const LETTER_GAP =
  1.45 * CELL

const WORD_WIDTH =
  WORD.length * LETTER_WIDTH +
  (WORD.length - 1) * LETTER_GAP

const WORD_HEIGHT =
  LETTER_ROWS * CELL

/*
 * The board sits around the visual center.
 *
 * Extra space above it is intentional:
 * falling pieces need somewhere to come from.
 */
const VIEWBOX_PADDING_X = 12
const VIEWBOX_TOP = 125
const VIEWBOX_BOTTOM = 45

const VIEWBOX_WIDTH =
  WORD_WIDTH +
  VIEWBOX_PADDING_X * 2

const VIEWBOX_HEIGHT =
  VIEWBOX_TOP +
  WORD_HEIGHT +
  VIEWBOX_BOTTOM

const BOARD_Y = VIEWBOX_TOP

/*
 * =============================================================
 * PHYSICS
 * =============================================================
 *
 * This is intentionally frame-rate independent.
 *
 * Normal gravity:
 *      natural slow falling
 *
 * Fast gravity:
 *      holding the animation accelerates the active piece
 *
 * We don't use CSS for the actual fall.
 * JavaScript controls the rigid piece like a tiny game engine.
 */

const NORMAL_GRAVITY = 1050
const FAST_GRAVITY = 5200

const MAX_VELOCITY = 1250

/*
 * Each new piece waits for the previous piece to settle.
 *
 * This prevents seven letters from dropping simultaneously.
 */
const NEXT_PIECE_DELAY = 90

/*
 * Small physical rebound when a piece lands.
 */
const LANDING_BOUNCE = 13

/*
 * Maximum time allowed for a piece to settle.
 * This protects against a stuck animation.
 */
const MAX_PIECE_TIME = 5000

/*
 * Start high enough that the user can clearly see
 * the brick entering from the top.
 */
const SPAWN_OFFSET = 105

export default function ExploreIntro() {
  const [started, setStarted] =
    useState(false)

  const [animationComplete, setAnimationComplete] =
    useState(false)

  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const animationFrameRef =
    useRef<number | null>(null)

  const lastTimeRef =
    useRef<number | null>(null)

  const pieceStartTimeRef =
    useRef<number | null>(null)

  const currentPieceRef =
    useRef(0)

  const fastDropRef =
    useRef(false)

  const runtimeRef =
    useRef<PieceRuntime[]>([])

  const pieceRefs =
    useRef<Array<SVGGElement | null>>([])

  /*
   * ===========================================================
   * CREATE THE FALLING PIECES
   * ===========================================================
   *
   * Each letter's upper three rows become ONE rigid piece.
   *
   * We do NOT split individual bricks.
   *
   * That is what makes it feel like a falling-block game.
   */

  const pieces = useMemo<FallingPiece[]>(() => {
    return WORD.map(
      (letter, letterIndex) => {
        const pattern =
          LETTERS[letter]

        const letterX =
          VIEWBOX_PADDING_X +
          letterIndex *
            (LETTER_WIDTH + LETTER_GAP)

        const cells: BrickCell[] = []

        /*
         * Upper half.
         *
         * Exactly rows 0, 1 and 2.
         */
        for (
          let row = 0;
          row <= 2;
          row++
        ) {
          const rowPattern =
            pattern[row]

          rowPattern
            .split('')
            .forEach(
              (value, column) => {
                if (value !== '1') {
                  return
                }

                cells.push({
                  row,
                  column,
                })
              },
            )
        }

        return {
          letterIndex,
          letter,
          cells,
          x: letterX,
          targetY: BOARD_Y,
          spawnY:
            BOARD_Y - SPAWN_OFFSET,
        }
      },
    )
  }, [])

  /*
   * ===========================================================
   * STATIC LOWER HALF
   * ===========================================================
   *
   * Rows 3–6 are already there before the animation begins.
   */

  const staticBricks = useMemo(() => {
    const result: Array<
      BrickCell & {
        x: number
        y: number
        letterIndex: number
      }
    > = []

    WORD.forEach(
      (letter, letterIndex) => {
        const pattern =
          LETTERS[letter]

        const letterX =
          VIEWBOX_PADDING_X +
          letterIndex *
            (LETTER_WIDTH + LETTER_GAP)

        for (
          let row = 3;
          row < LETTER_ROWS;
          row++
        ) {
          const rowPattern =
            pattern[row]

          rowPattern
            .split('')
            .forEach(
              (value, column) => {
                if (value !== '1') {
                  return
                }

                result.push({
                  row,
                  column,
                  letterIndex,
                  x:
                    letterX +
                    column * CELL,
                  y:
                    BOARD_Y +
                    row * CELL,
                })
              },
            )
        }
      },
    )

    return result
  }, [])

  /*
   * ===========================================================
   * BRICK COMPONENT
   * ===========================================================
   */

  const Brick = ({
    x,
    y,
    falling = false,
  }: {
    x: number
    y: number
    falling?: boolean
  }) => {
    return (
      <g
        transform={`translate(${x}, ${y})`}
      >
        {/* Main body */}
        <rect
          width={BRICK_SIZE}
          height={BRICK_SIZE}
          rx={3.2}
          fill={
            falling
              ? 'url(#exploreFallingGradient)'
              : 'url(#exploreStaticGradient)'
          }
        />

        {/* Upper glossy face */}
        <rect
          x="2"
          y="1.8"
          width={BRICK_SIZE - 4}
          height="3"
          rx="1.5"
          fill="#FFFFFF"
          opacity={
            falling ? 0.34 : 0.22
          }
        />

        {/* Left edge highlight */}
        <rect
          x="1.8"
          y="5"
          width="1.7"
          height={BRICK_SIZE - 7}
          rx="0.8"
          fill="#FFFFFF"
          opacity={
            falling ? 0.15 : 0.1
          }
        />

        {/* Lower shadow/depth */}
        <rect
          x="2"
          y={BRICK_SIZE - 3.2}
          width={BRICK_SIZE - 4}
          height="1.7"
          rx="0.8"
          fill="#B77725"
          opacity={
            falling ? 0.28 : 0.2
          }
        />

        {/* Inner border */}
        <rect
          x="0.7"
          y="0.7"
          width={BRICK_SIZE - 1.4}
          height={BRICK_SIZE - 1.4}
          rx="2.8"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={
            falling ? 0.16 : 0.1
          }
        />
      </g>
    )
  }

  /*
 * ===========================================================
 * UPDATE ACTIVE PIECE
 * ===========================================================
 *
 * ONLY ONE PIECE IS VISIBLE/ACTIVE AT A TIME.
 *
 * Flow:
 *
 *   piece 1 appears
 *        ↓
 *   falls
 *        ↓
 *   tiny bounce
 *        ↓
 *   locks
 *        ↓
 *   piece 2 appears
 *        ↓
 *   repeat
 */

  const updateActivePiece =
    useCallback(
      (
        now: number,
        deltaTime: number,
      ) => {
        const index =
          currentPieceRef.current

        const piece =
          pieces[index]

        const state =
          runtimeRef.current[index]

        const element =
          pieceRefs.current[index]

        if (
          !piece ||
          !state ||
          !element ||
          state.settled
        ) {
          return
        }

        /*
         * Make sure the current piece is visible.
         */
        element.style.opacity = '1'

        /*
         * -------------------------------------------------------
         * GRAVITY
         * -------------------------------------------------------
         */

        const gravity =
          fastDropRef.current
            ? FAST_GRAVITY
            : NORMAL_GRAVITY

        state.velocity +=
          gravity * deltaTime

        state.velocity =
          Math.min(
            state.velocity,
            MAX_VELOCITY,
          )

        state.y +=
          state.velocity *
          deltaTime

        /*
         * -------------------------------------------------------
         * LANDING
         * -------------------------------------------------------
         */

        if (
          state.y >=
          piece.targetY
        ) {
          state.y =
            piece.targetY

          /*
           * First collision:
           * give the entire piece a tiny bounce.
           */
          if (
            state.bounce === 0
          ) {
            state.bounce = 1

            state.velocity =
              -Math.sqrt(
                2 *
                  gravity *
                  LANDING_BOUNCE,
              )

            element.setAttribute(
              'transform',
              `translate(${piece.x}, ${state.y})`,
            )

            return
          }

          /*
           * -----------------------------------------------------
           * FINAL LOCK
           * -----------------------------------------------------
           */

          state.y =
            piece.targetY

          state.velocity = 0
          state.settled = true
          state.active = false

          element.setAttribute(
            'transform',
            `translate(${piece.x}, ${piece.targetY})`,
          )

          element.style.opacity = '1'

          /*
           * -----------------------------------------------------
           * NEXT PIECE
           * -----------------------------------------------------
           */

          if (
            currentPieceRef.current !==
            index
          ) {
            return
          }

          const nextIndex =
            index + 1

          currentPieceRef.current =
            nextIndex

          /*
           * All letters have landed.
           */
          if (
            nextIndex >=
            pieces.length
          ) {
            setAnimationComplete(true)
            return
          }

          /*
           * IMPORTANT:
           *
           * Put the next piece at its spawn position BEFORE
           * making it visible.
           */
          const nextPiece =
            pieces[nextIndex]

          const nextElement =
            pieceRefs.current[
              nextIndex
            ]

          const nextState =
            runtimeRef.current[
              nextIndex
            ]

          if (
            nextState
          ) {
            nextState.y =
              nextPiece.spawnY

            nextState.velocity = 0
            nextState.settled = false
            nextState.bounce = 0
            nextState.active = false
          }

          if (
            nextElement
          ) {
            nextElement.setAttribute(
              'transform',
              `translate(${nextPiece.x}, ${nextPiece.spawnY})`,
            )

            nextElement.style.opacity =
              '0'
          }

          /*
           * Small pause before the next letter.
           */
          pieceStartTimeRef.current =
            now +
            NEXT_PIECE_DELAY

          return
        }

        /*
         * -------------------------------------------------------
         * NORMAL FALLING
         * -------------------------------------------------------
         */

        element.setAttribute(
          'transform',
          `translate(${piece.x}, ${state.y})`,
        )
      },
      [pieces],
    )

  /*
 * ===========================================================
 * GAME LOOP
 * ===========================================================
 *
 * IMPORTANT:
 *
 * Only the current letter exists visually.
 *
 * The other six pieces stay completely invisible
 * until their turn.
 */

  useEffect(() => {
    if (!started) {
      return
    }

    /*
     * ---------------------------------------------------------
     * RESET
     * ---------------------------------------------------------
     */

    currentPieceRef.current = 0

    fastDropRef.current = false

    lastTimeRef.current = null

    pieceStartTimeRef.current = null

    /*
     * Fresh runtime state for every letter.
     */
    runtimeRef.current =
      pieces.map((piece) => ({
        y: piece.spawnY,
        velocity: 0,
        settled: false,
        bounce: 0,
        active: false,
      }))

    /*
     * ---------------------------------------------------------
     * INITIALIZE ALL PIECES
     * ---------------------------------------------------------
     *
     * Every piece starts at its own spawn position.
     *
     * Only piece 0 is visible.
     */
    pieces.forEach(
      (piece, index) => {
        const element =
          pieceRefs.current[index]

        if (!element) {
          return
        }

        element.setAttribute(
          'transform',
          `translate(${piece.x}, ${piece.spawnY})`,
        )

        element.style.opacity =
          index === 0
            ? '1'
            : '0'
      },
    )

    const loop = (
      time: number,
    ) => {
      /*
       * -------------------------------------------------------
       * FIRST FRAME
       * -------------------------------------------------------
       */

      if (
        lastTimeRef.current === null
      ) {
        lastTimeRef.current =
          time

        pieceStartTimeRef.current =
          time
      }

      /*
       * -------------------------------------------------------
       * DELTA TIME
       * -------------------------------------------------------
       *
       * Cap it so a background-tab pause cannot cause
       * the piece to teleport through the board.
       */

      const deltaTime =
        Math.min(
          (
            time -
            lastTimeRef.current
          ) / 1000,
          0.032,
        )

      lastTimeRef.current =
        time

      const index =
        currentPieceRef.current

      /*
       * -------------------------------------------------------
       * COMPLETE
       * -------------------------------------------------------
       */

      if (
        index >=
        pieces.length
      ) {
        animationFrameRef.current =
          null

        return
      }

      /*
       * -------------------------------------------------------
       * WAIT BEFORE NEXT LETTER
       * -------------------------------------------------------
       */

      if (
        pieceStartTimeRef.current !==
          null &&
        time <
          pieceStartTimeRef.current
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            loop,
          )

        return
      }

      /*
       * -------------------------------------------------------
       * CURRENT PIECE
       * -------------------------------------------------------
       */

      const current =
        runtimeRef.current[index]

      const piece =
        pieces[index]

      const element =
        pieceRefs.current[index]

      if (
        !current ||
        !piece ||
        !element
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            loop,
          )

        return
      }

      /*
       * Activate it only when its turn begins.
       */
      current.active = true

      element.style.opacity =
        '1'

      /*
       * -------------------------------------------------------
       * SAFETY TIMEOUT
       * -------------------------------------------------------
       */

      const startTime =
        pieceStartTimeRef.current ??
        time

      if (
        time -
          startTime >
        MAX_PIECE_TIME
      ) {
        /*
         * Force-lock the current piece.
         */
        current.y =
          piece.targetY

        current.velocity = 0
        current.settled = true
        current.bounce = 1
        current.active = false

        element.style.opacity =
          '1'

        element.setAttribute(
          'transform',
          `translate(${piece.x}, ${piece.targetY})`,
        )

        /*
         * Move to next piece.
         */
        const nextIndex =
          index + 1

        currentPieceRef.current =
          nextIndex

        /*
         * Finished.
         */
        if (
          nextIndex >=
          pieces.length
        ) {
          setAnimationComplete(
            true,
          )

          animationFrameRef.current =
            null

          return
        }

        /*
         * Prepare next piece at spawn.
         */
        const nextPiece =
          pieces[nextIndex]

        const nextState =
          runtimeRef.current[
            nextIndex
          ]

        const nextElement =
          pieceRefs.current[
            nextIndex
          ]

        if (
          nextState
        ) {
          nextState.y =
            nextPiece.spawnY

          nextState.velocity = 0
          nextState.settled = false
          nextState.bounce = 0
          nextState.active = false
        }

        if (
          nextElement
        ) {
          nextElement.setAttribute(
            'transform',
            `translate(${nextPiece.x}, ${nextPiece.spawnY})`,
          )

          nextElement.style.opacity =
            '0'
        }

        pieceStartTimeRef.current =
          time +
          NEXT_PIECE_DELAY
      } else {
        /*
         * -------------------------------------------------------
         * NORMAL PHYSICS
         * -------------------------------------------------------
         */

        updateActivePiece(
          time,
          deltaTime,
        )
      }

      /*
       * Keep the engine running.
       */
      animationFrameRef.current =
        requestAnimationFrame(
          loop,
        )
    }

    animationFrameRef.current =
      requestAnimationFrame(
        loop,
      )

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        )

        animationFrameRef.current =
          null
      }

      /*
       * Release input acceleration when
       * the animation is restarted/unmounted.
       */
      fastDropRef.current =
        false
    }
  }, [
    started,
    pieces,
    updateActivePiece,
  ])

   const popperPieces = useMemo<PopperPiece[]>(
  () => [
    {
      x: 0,
      y: 0,
      rotation: -34,
      delay: 0,
      color: '#F4B860',
      width: 7,
      height: 13,
    },
    {
      x: 10,
      y: -8,
      rotation: 18,
      delay: 0.04,
      color: '#FFD77F',
      width: 6,
      height: 11,
    },
    {
      x: 20,
      y: -15,
      rotation: -12,
      delay: 0.08,
      color: '#E5A84F',
      width: 7,
      height: 12,
    },
    {
      x: 29,
      y: -2,
      rotation: 32,
      delay: 0.12,
      color: '#F8C875',
      width: 6,
      height: 10,
    },
    {
      x: 38,
      y: -18,
      rotation: -28,
      delay: 0.16,
      color: '#DFA04A',
      width: 7,
      height: 12,
    },
    {
      x: 47,
      y: -5,
      rotation: 14,
      delay: 0.2,
      color: '#F4B860',
      width: 6,
      height: 11,
    },
    {
      x: 56,
      y: -22,
      rotation: 38,
      delay: 0.24,
      color: '#FFD77F',
      width: 7,
      height: 13,
    },
    {
      x: 65,
      y: -10,
      rotation: -18,
      delay: 0.28,
      color: '#E5A84F',
      width: 6,
      height: 10,
    },
  ],
  [],
)

  /*
   * ===========================================================
   * START ANIMATION
   * ===========================================================
   */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setStarted(true)
      }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  /*
   * ===========================================================
   * POINTER / TOUCH CONTROL
   * ===========================================================
   *
   * Holding the animation makes the active piece fall faster.
   *
   * This is intentionally pointer-based so it works with:
   *
   * - touch
   * - mouse
   * - stylus
   */

  const handlePointerDown =
    useCallback(
      (event: React.PointerEvent) => {
        if (animationComplete) {
          return
        }

        /*
         * Prevent scrolling/selection while
         * interacting with the tiny game.
         */
        event.preventDefault()

        fastDropRef.current = true

        try {
          event.currentTarget.setPointerCapture(
            event.pointerId,
          )
        } catch {
          /*
           * Some browsers don't support pointer capture
           * consistently. Nothing needs to happen here.
           */
        }
      },
      [animationComplete],
    )

  const handlePointerUp =
    useCallback(
      (event: React.PointerEvent) => {
        event.preventDefault()

        fastDropRef.current = false

        try {
          if (
            event.currentTarget.hasPointerCapture(
              event.pointerId,
            )
          ) {
            event.currentTarget.releasePointerCapture(
              event.pointerId,
            )
          }
        } catch {
          /*
           * Safe fallback.
           */
        }
      },
      [],
    )

  /*
   * ===========================================================
   * KEYBOARD SUPPORT
   * ===========================================================
   *
   * Holding Space / ArrowDown also accelerates the piece.
   * This doesn't interfere with the normal page.
   */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.code === 'Space' ||
        event.code === 'ArrowDown'
      ) {
        if (!animationComplete) {
          fastDropRef.current = true
        }
      }
    }

    const handleKeyUp = (
      event: KeyboardEvent,
    ) => {
      if (
        event.code === 'Space' ||
        event.code === 'ArrowDown'
      ) {
        fastDropRef.current = false
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    window.addEventListener(
      'keyup',
      handleKeyUp,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp,
      )
    }
  }, [animationComplete])

  /*
   * ===========================================================
   * REDUCED MOTION
   * ===========================================================
   */

  const [reducedMotion, setReducedMotion] =
    useState(false)

  const [exploreVisible, setExploreVisible] =
  useState(true)

const lastScrollYRef =
  useRef(0)

  const autoScrollTriggeredRef =
  useRef(false)
  const autoScrollingRef =
  useRef(false)

useEffect(() => {
  /*
   * ===========================================================
   * EXPLORE → FIRST QUESTION AUTOMATIC TRANSITION
   * ===========================================================
   *
   * Desired flow:
   *
   *   EXPLORE animation finishes
   *          ↓
   *   automatic fast scroll
   *          ↓
   *   first question reaches below fixed header
   *          ↓
   *   STOP
   *
   * IMPORTANT:
   *
   * We DO NOT collapse the Explore section during this
   * automatic scroll.
   *
   * The Explore section must keep its original height while
   * we calculate the question's document position.
   *
   * Once the page has scrolled to the question, Explore is
   * already above the viewport naturally.
   */

  const getHeaderHeight = () => {
    const header =
      document.querySelector('header')

    return (
      header?.getBoundingClientRect().height ?? 64
    )
  }

  const getExploreSection = () => {
    return document.querySelector(
      'section[aria-label="Explore EggPuff"]',
    ) as HTMLElement | null
  }

  const getFirstQuestion = () => {
    const exploreSection =
      getExploreSection()

    if (!exploreSection) {
      return null
    }

    /*
     * The first question is expected to be the
     * element immediately following Explore.
     */
    return exploreSection
      .nextElementSibling as HTMLElement | null
  }

  /*
   * ===========================================================
   * USER SCROLL DETECTION
   * ===========================================================
   */

  lastScrollYRef.current =
    window.scrollY

  let ticking = false

  /*
   * This ref lives ONLY for this effect instance.
   *
   * While the automatic scroll is happening, we don't want
   * the scroll listener to think that the user is manually
   * scrolling.
   */

  const handleScroll = () => {
    if (ticking) {
      return
    }

    ticking = true

    window.requestAnimationFrame(() => {
      const currentScrollY =
        window.scrollY

      /*
       * Ignore all scroll-direction logic while our
       * automatic intro → question movement is running.
       */
      if (autoScrollingRef.current) {
        lastScrollYRef.current =
          currentScrollY

        ticking = false
        return
      }

      const previousScrollY =
        lastScrollYRef.current

      const difference =
        currentScrollY -
        previousScrollY

      /*
       * Ignore tiny movements.
       */
      if (Math.abs(difference) >= 4) {

        /*
         * =====================================================
         * USER SCROLLING DOWN
         * =====================================================
         */

        if (
          difference > 0 &&
          exploreVisible
        ) {
          setExploreVisible(false)
        }

        /*
         * =====================================================
         * USER SCROLLING UP
         * =====================================================
         */

        if (
          difference < 0 &&
          !exploreVisible
        ) {
          const firstQuestion =
            getFirstQuestion()

          const headerHeight =
            getHeaderHeight()

          if (firstQuestion) {
            const questionRect =
              firstQuestion.getBoundingClientRect()

            const distanceFromHeader =
              questionRect.top -
              headerHeight

            /*
             * When the first question reaches the top area,
             * bring Explore back.
             */
            if (
              distanceFromHeader <= 16
            ) {
              setExploreVisible(true)

              lastScrollYRef.current =
                currentScrollY

              ticking = false

              return
            }
          }

          /*
           * Safety fallback near the very top.
           */
          if (
            currentScrollY <= 24
          ) {
            setExploreVisible(true)

            lastScrollYRef.current =
              currentScrollY

            ticking = false

            return
          }
        }
      }

      lastScrollYRef.current =
        currentScrollY

      ticking = false
    })
  }

  window.addEventListener(
    'scroll',
    handleScroll,
    {
      passive: true,
    },
  )

  /*
   * ===========================================================
   * AUTOMATIC INTRO → FIRST QUESTION
   * ===========================================================
   */

  const moveToFirstQuestion = () => {
  /*
   * Animation MUST be completely finished first.
   */
  if (!animationComplete) {
    return
  }

  /*
   * Only trigger this once.
   */
  if (
    autoScrollTriggeredRef.current
  ) {
    return
  }

  const firstQuestion =
    getFirstQuestion()

  if (!firstQuestion) {
    return
  }

  const headerHeight =
    getHeaderHeight()

  /*
   * =========================================================
   * CALCULATE TARGET
   * =========================================================
   */

  const questionRect =
    firstQuestion.getBoundingClientRect()

  const targetTop =
    headerHeight + 16

  const startY =
    window.scrollY

  const targetY =
    startY +
    (
      questionRect.top -
      targetTop
    )

  /*
   * Already at the correct position.
   */
  if (
    Math.abs(
      questionRect.top -
      targetTop,
    ) < 8
  ) {
    autoScrollTriggeredRef.current =
      true

    autoScrollingRef.current =
      false

    lastScrollYRef.current =
      window.scrollY

    return
  }

  /*
   * =========================================================
   * LOCK AUTOMATIC SCROLL
   * =========================================================
   *
   * This prevents the normal scroll listener from
   * collapsing Explore while the automatic movement
   * is happening.
   */

  autoScrollTriggeredRef.current =
    true

  autoScrollingRef.current =
    true

  /*
   * Keep Explore occupying its original space.
   */
  setExploreVisible(true)

  /*
   * =========================================================
   * FAST CUSTOM SCROLL
   * =========================================================
   *
   * Browser smooth-scroll speed varies by browser/device.
   *
   * Instead we control the animation ourselves.
   *
   * 320ms = fast, but still visually intentional.
   */

  const distance =
    targetY -
    startY

  const duration =
    240

  const scrollStartTime =
    performance.now()

  const easeOutCubic = (
    progress: number,
  ) => {
    return (
      1 -
      Math.pow(
        1 - progress,
        3,
      )
    )
  }

  const animateScroll = (
    currentTime: number,
  ) => {
    const elapsed =
      currentTime -
      scrollStartTime

    const progress =
      Math.min(
        elapsed /
          duration,
        1,
      )

    const easedProgress =
      easeOutCubic(
        progress,
      )

    window.scrollTo(
      0,
      startY +
        distance *
          easedProgress,
    )

    if (
      progress < 1
    ) {
      window.requestAnimationFrame(
        animateScroll,
      )

      return
    }

    /*
     * =======================================================
     * FINAL POSITION CORRECTION
     * =======================================================
     */

    const finalQuestion =
      getFirstQuestion()

    if (finalQuestion) {
      const finalRect =
        finalQuestion.getBoundingClientRect()

      const finalDistance =
        finalRect.top -
        targetTop

      /*
       * Snap the last few pixels into place.
       */
      if (
        Math.abs(
          finalDistance,
        ) > 1
      ) {
        window.scrollBy(
          0,
          finalDistance,
        )
      }
    }

    /*
     * Automatic movement is completely finished.
     */
    autoScrollingRef.current =
      false

    lastScrollYRef.current =
      window.scrollY
  }

  window.requestAnimationFrame(
    animateScroll,
  )
}

  /*
   * ===========================================================
   * WAIT FOR THE BRICK ANIMATION
   * ===========================================================
   *
   * 120ms gives React one frame after animationComplete
   * becomes true before starting the page movement.
   */

  let autoScrollTimer:
  number | null = null

if (
  animationComplete &&
  !autoScrollTriggeredRef.current
) {
  autoScrollTimer =
    window.setTimeout(
      moveToFirstQuestion,
      5000,
    )
}

  /*
   * ===========================================================
   * CLEANUP
   * ===========================================================
   */

  return () => {
    if (
      autoScrollTimer !== null
    ) {
      window.clearTimeout(
        autoScrollTimer,
      )
    }

    window.removeEventListener(
      'scroll',
      handleScroll,
    )
  }
}, [
  animationComplete,
  exploreVisible,
])

  useEffect(() => {
    const media =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      )

    const update = () => {
      setReducedMotion(media.matches)
    }

    update()

    media.addEventListener(
      'change',
      update,
    )

    return () => {
      media.removeEventListener(
        'change',
        update,
      )
    }
  }, [])

  useEffect(() => {
    if (!reducedMotion) {
      return
    }

    setStarted(true)
    setAnimationComplete(true)

    /*
     * Immediately lock every piece.
     */
    pieces.forEach(
      (piece, index) => {
        const element =
          pieceRefs.current[index]

        if (!element) {
          return
        }

        element.setAttribute(
          'transform',
          `translate(${piece.x}, ${piece.targetY})`,
        )
      },
    )
  }, [reducedMotion, pieces])

  return (
  <section
    aria-label="Explore EggPuff"
    style={{
  width: '100%',

  /*
   * IMPORTANT:
   *
   * When Explore is hidden, it must stop
   * occupying the huge 80svh space.
   */
  minHeight:
    exploreVisible
      ? '80svh'
      : 0,

  height:
    exploreVisible
      ? '80svh'
      : 0,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',

  scrollSnapAlign: 'start',
  overflowAnchor: 'none',

  padding:
    exploreVisible
      ? '22px 8px 48px'
      : '0 8px',

  background: 'transparent',

  /*
   * Scroll down → fade OUT.
   * Scroll up → fade IN.
   */
  opacity:
    exploreVisible ? 1 : 0,

  /*
   * Animate both the visual fade
   * and the space the section occupies.
   */
  transition:
  'opacity 0.18s ease, min-height 0.18s ease, height 0.18s ease, padding 0.18s ease',

  pointerEvents:
    exploreVisible
      ? 'auto'
      : 'none',
}}
  >
      {/* =======================================================
          SOFT AMBIENT LIGHT
         ======================================================= */}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width:
            'min(560px, 110vw)',
          height:
            'min(560px, 110vw)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(244,184,96,0.09) 0%, rgba(244,184,96,0) 70%)',
          top: '45%',
          left: '50%',
          transform:
            'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* =======================================================
          FALLING-BLOCK AREA
         ======================================================= */}

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 760,

          /*
           * IMPORTANT:
           *
           * This prevents the browser from interpreting
           * a touch as scrolling while the user interacts
           * with the falling piece.
           */
          touchAction: 'none',

          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onPointerDown={
          handlePointerDown
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onPointerLeave={
          handlePointerUp
        }
      >
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Explore"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          <defs>
            {/* =================================================
                FALLING BRICK
               ================================================= */}

            <linearGradient
              id="exploreFallingGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#FFD77F"
              />

              <stop
                offset="45%"
                stopColor="#F4B860"
              />

              <stop
                offset="100%"
                stopColor="#DFA04A"
              />
            </linearGradient>

            {/* =================================================
                ALREADY BUILT BRICK
               ================================================= */}

            <linearGradient
              id="exploreStaticGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#F8C875"
              />

              <stop
                offset="100%"
                stopColor="#E5A84F"
              />
            </linearGradient>

            {/* =================================================
    PARTY POPPER GRADIENT
   ================================================= */}

<linearGradient
  id="explorePopperGradient"
  x1="0"
  y1="0"
  x2="1"
  y2="1"
>
  <stop
    offset="0%"
    stopColor="#FFD77F"
  />

  <stop
    offset="48%"
    stopColor="#F4B860"
  />

  <stop
    offset="100%"
    stopColor="#DFA04A"
  />
</linearGradient>

            {/* =================================================
                SOFT SHADOW
               ================================================= */}

            <filter
              id="exploreBrickShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="220%"
            >
              <feDropShadow
                dx="0"
                dy="2.2"
                stdDeviation="1.8"
                floodColor="#9A641E"
                floodOpacity="0.16"
              />
            </filter>
          </defs>

          {/* ===================================================
              SUBTLE BOARD GRID
              
              Extremely faint.
              It should be felt, not noticed.
             =================================================== */}

          <g opacity="0.018">
            {Array.from({
              length: LETTER_ROWS,
            }).map((_, row) =>
              Array.from({
                length:
                  WORD.length *
                    LETTER_COLUMNS +
                  (WORD.length - 1) *
                    2,
              }).map(
                (__, column) => (
                  <rect
                    key={`grid-${row}-${column}`}
                    x={
                      VIEWBOX_PADDING_X +
                      column * CELL
                    }
                    y={
                      BOARD_Y +
                      row * CELL
                    }
                    width={
                      BRICK_SIZE
                    }
                    height={
                      BRICK_SIZE
                    }
                    rx={3}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="0.65"
                  />
                ),
              ),
            )}
          </g>

          {/* ===================================================
              ALREADY BUILT LOWER HALF
              
              THIS IS ALWAYS PRESENT.
              
              Rows 3–6.
             =================================================== */}

          <g filter="url(#exploreBrickShadow)">
            {staticBricks.map(
              (brick) => (
                <Brick
                  key={`static-${brick.letterIndex}-${brick.row}-${brick.column}`}
                  x={brick.x}
                  y={brick.y}
                />
              ),
            )}
          </g>

          {/* ===================================================
              FALLING UPPER HALF
              
              Each letter = ONE rigid piece.
             =================================================== */}

          {pieces.map(
            (piece, pieceIndex) => (
              <g
                key={`falling-piece-${piece.letterIndex}`}
                ref={(element) => {
                  pieceRefs.current[
                    pieceIndex
                  ] = element
                }}
                transform={`translate(${piece.x}, ${piece.spawnY})`}
                filter="url(#exploreBrickShadow)"
                style={{
                  pointerEvents: 'none',
                  willChange: 'transform',
                  opacity: 1,
                }}
              >
                {piece.cells.map(
                  (cell) => (
                    <Brick
                      key={`${piece.letterIndex}-${cell.row}-${cell.column}`}
                      x={
                        cell.column *
                        CELL
                      }
                      y={
                        cell.row * CELL
                      }
                      falling
                    />
                  ),
                )}
              </g>
            ),
          )}

          {/* ===================================================
              LANDING GUIDE
              
              Barely visible.
             =================================================== */}

          <line
            x1={
              VIEWBOX_PADDING_X
            }
            x2={
              VIEWBOX_WIDTH -
              VIEWBOX_PADDING_X
            }
            y1={
              BOARD_Y +
              3 * CELL -
              1.2
            }
            y2={
              BOARD_Y +
              3 * CELL -
              1.2
            }
            stroke="#F4B860"
            strokeOpacity="0.018"
            strokeWidth="1"
          />

          {/* ===================================================
              FINAL LOCK FLASH
             =================================================== */}

          {animationComplete && (
            <line
              x1={
                VIEWBOX_PADDING_X
              }
              x2={
                VIEWBOX_WIDTH -
                VIEWBOX_PADDING_X
              }
              y1={
                BOARD_Y +
                3 * CELL -
                1
              }
              y2={
                BOARD_Y +
                3 * CELL -
                1
              }
              stroke="#F4B860"
              strokeOpacity="0.055"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>

      {/* =======================================================
          EXPLANATION
         ======================================================= */}

      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: 390,
          textAlign: 'center',
          marginTop: -2,

          opacity:
            started || reducedMotion
              ? 1
              : 0,

          transform:
            started || reducedMotion
              ? 'translateY(0)'
              : 'translateY(12px)',

          transition:
            'opacity 0.7s ease 1.6s, transform 0.7s ease 1.6s',
        }}
      >
        <div
          style={{
            fontSize:
              'clamp(17px, 4.5vw, 21px)',
            fontWeight: 750,
            color: '#111827',
            letterSpacing:
              '-0.025em',
            marginBottom: 8,
          }}
        >
          Your campus isn’t here yet.
        </div>

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: '#6B7280',
            maxWidth: 340,
            margin: '0 auto',
          }}
        >
          Explore what students are asking
          beyond your campus.
        </div>
      </div>

      {/* =======================================================
    PROFILE SETUP + SCROLL CUE
   ======================================================= */}

<div
  style={{
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,

    opacity: started ? 0.72 : 0,

    transition: 'opacity 0.8s ease 2.3s',

    pointerEvents: started ? 'auto' : 'none',
  }}
>
  {/* Profile setup shortcut */}
  <button
    type="button"
    onClick={() => {
      window.location.href = '/profile'
    }}
    style={{
      border: 'none',
      background: 'transparent',
      padding: '4px 8px',
      margin: 0,

      fontSize: 12,
      fontWeight: 600,
      color: '#9CA3AF',
      letterSpacing: '0.02em',

      cursor: 'pointer',
      textDecoration: 'underline',
      textUnderlineOffset: 3,

      transition:
        'color 0.18s ease, opacity 0.18s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#6B7280'
      e.currentTarget.style.opacity = '1'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = '#9CA3AF'
      e.currentTarget.style.opacity = '1'
    }}
  >
    Set up your profile
  </button>

  {/* Existing scroll cue */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      pointerEvents: 'none',
    }}
  >
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: '#9CA3AF',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      Scroll to explore
    </span>

    <span
      style={{
        display: 'block',
        width: 7,
        height: 7,
        borderRight: '1.5px solid #9CA3AF',
        borderBottom: '1.5px solid #9CA3AF',
        transform: 'rotate(45deg)',
        animation:
          'exploreScrollArrow 1.7s ease-in-out infinite',
      }}
    />
  </div>
</div>
      

      {/* =======================================================
          ANIMATIONS
         ======================================================= */}

      <style jsx>{`

              @keyframes popperPaperBurst {
          0% {
            opacity: 0;
            transform: translate(-12px, 16px) scale(0.3);
          }

          15% {
            opacity: 1;
            transform: translate(-4px, 5px) scale(0.8);
          }

          55% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }

          100% {
            opacity: 0;
            transform: translate(0, 10px) scale(0.85);
          }
        }

        @keyframes exploreScrollArrow {
          0%,
          100% {
            transform:
              translateY(0)
              rotate(45deg);
            opacity: 0.4;
          }

          50% {
            transform:
              translateY(5px)
              rotate(45deg);
            opacity: 1;
          }
        }

        @media (max-width: 430px) {
          section {
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  )
}