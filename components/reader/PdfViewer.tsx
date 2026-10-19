'use client'

import {
  Document,
  Page,
} from 'react-pdf'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'

type Props = {
  fileUrl: string

  numPages: number

  setNumPages: (
    pages: number
  ) => void

  pageWidth: number
}

type Point = {
  x: number
  y: number
}

export default function PdfViewer({
  fileUrl,
  numPages,
  setNumPages,
  pageWidth,
}: Props) {
  /*
   * ─────────────────────────────────────────
   * CONFIG
   * ─────────────────────────────────────────
   */

  const MIN_SCALE = 1
  const MAX_SCALE = 4

  /*
   * How sensitive pinch zoom is.
   *
   * Lower = slower / smoother.
   */
  const PINCH_SENSITIVITY = 0.85

  /*
   * ─────────────────────────────────────────
   * STATE
   * ─────────────────────────────────────────
   */

  const [loaded, setLoaded] =
    useState(false)

  /*
   * This is the REAL rendered PDF scale.
   *
   * React-PDF only re-renders when this
   * changes.
   */
  const [renderScale, setRenderScale] =
    useState(1)

  /*
   * Temporary visual scale used while
   * the user is actively pinching.
   *
   * This changes frequently but does NOT
   * force React-PDF to render every time.
   */
  const [gestureScale, setGestureScale] =
    useState<number | null>(null)

  const [renderedPages, setRenderedPages] =
    useState<Set<number>>(
      () => new Set([1, 2, 3])
    )

  const pageObserversRef =
    useRef<
      Map<number, IntersectionObserver>
    >(
      new Map()
    )

  /*
   * ─────────────────────────────────────────
   * REFS
   * ─────────────────────────────────────────
   */

  const viewerRef =
    useRef<HTMLDivElement | null>(null)

  const documentRef =
    useRef<HTMLDivElement | null>(null)

  const pinchRef =
    useRef<{
      startDistance: number
      startScale: number

      pageNumber: number

      pageRelativeY: number
      pageRelativeX: number

      /*
       * Keep the exact screen position
       * of the user's fingers.
       */
      viewportX: number
      viewportY: number

      /*
       * Make the temporary visual zoom
       * happen around the fingers instead
       * of the top-left corner.
       */
      transformOriginX: number
      transformOriginY: number
    } | null>(null)

  /*
   * Anchor that must survive the real
   * React-PDF re-render.
   */
  const pendingAnchorRef =
    useRef<{
      pageNumber: number
      pageRelativeY: number
      pageRelativeX: number

      viewportX: number
      viewportY: number

      targetScale: number
    } | null>(null)

  const renderScaleRef =
    useRef(1)

  const gestureScaleRef =
    useRef<number | null>(null)

  /*
   * Keep the latest page width available
   * without rebuilding gesture handlers.
   */
  const pageWidthRef =
    useRef(pageWidth)

  useEffect(() => {
    pageWidthRef.current =
      pageWidth
  }, [pageWidth])

  useEffect(() => {
    if (!numPages)
      return

    setRenderedPages((current) => {
      const next = new Set(current)

      next.add(1)

      if (numPages >= 2)
        next.add(2)

      if (numPages >= 3)
        next.add(3)

      return next
    })
  }, [numPages])

  /*
   * ─────────────────────────────────────────
   * SCALE HELPERS
   * ─────────────────────────────────────────
   */

  const clampScale = useCallback(
    (value: number) => {
      return Math.min(
        MAX_SCALE,
        Math.max(
          MIN_SCALE,
          value
        )
      )
    },
    []
  )

  /*
   * ─────────────────────────────────────────
   * DISTANCE BETWEEN TWO TOUCHES
   * ─────────────────────────────────────────
   */

  const getTouchDistance = (
    touches: TouchList
  ) => {
    if (touches.length < 2)
      return 0

    const dx =
      touches[0].clientX -
      touches[1].clientX

    const dy =
      touches[0].clientY -
      touches[1].clientY

    return Math.hypot(
      dx,
      dy
    )
  }

  /*
   * ─────────────────────────────────────────
   * PINCH CENTER
   * ─────────────────────────────────────────
   */

  const getTouchCenter = (
    touches: TouchList
  ): Point => {
    return {
      x:
        (
          touches[0].clientX +
          touches[1].clientX
        ) / 2,

      y:
        (
          touches[0].clientY +
          touches[1].clientY
        ) / 2,
    }
  }

  /*
   * ─────────────────────────────────────────
   * BEGIN PINCH
   * ─────────────────────────────────────────
   */

  const handleTouchStart = (
    event: TouchEvent
  ) => {
    if (
      event.touches.length !== 2
    ) {
      return
    }

    const distance =
      getTouchDistance(
        event.touches
      )

    if (!distance)
      return

    const center =
      getTouchCenter(
        event.touches
      )

    const viewer =
      viewerRef.current

    if (!viewer)
      return

    /*
     * Find the exact PDF page under
     * the user's fingers.
     *
     * This is the important part.
     *
     * We don't anchor zoom to the
     * whole reader anymore.
     */
    const elements =
      document.elementsFromPoint(
        center.x,
        center.y
      )

    const pageElement =
      elements.find(
        (element) =>
          element instanceof HTMLElement &&
          element.matches(
            '.react-pdf__Page'
          )
      ) as HTMLElement | undefined

    /*
     * If the fingers are between pages,
     * fall back to the page currently
     * closest to the pinch center.
     */
    let targetPage =
      pageElement

    if (!targetPage) {
      const pages =
        Array.from(
          document.querySelectorAll(
            '.react-pdf__Page'
          )
        ) as HTMLElement[]

      let closestPage:
        | HTMLElement
        | null = null

      let closestDistance =
        Infinity

      pages.forEach((page) => {
        const rect =
          page.getBoundingClientRect()

        const distance =
          Math.abs(
            center.y -
            (
              rect.top +
              rect.height / 2
            )
          )

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance

          closestPage =
            page
        }
      })

      targetPage =
        closestPage ?? undefined
    }

    if (!targetPage)
      return

    const pageRect =
      targetPage.getBoundingClientRect()

    /*
     * Do NOT depend on data-page-number.
     *
     * The DOM order is the actual PDF page
     * order and is much more reliable.
     */
    const pages =
      Array.from(
        document.querySelectorAll(
          '.react-pdf__Page'
        )
      ) as HTMLElement[]

    const pageIndex =
      pages.indexOf(targetPage)

    if (pageIndex < 0)
      return

    const pageNumber =
      pageIndex + 1

    const pageRelativeY =
      pageRect.height > 0
        ? (
          center.y -
          pageRect.top
        ) /
        pageRect.height
        : 0

    const pageRelativeX =
      pageRect.width > 0
        ? (
          center.x -
          pageRect.left
        ) /
        pageRect.width
        : 0

    /*
     * Calculate the transform origin
     * relative to the actual document.
     *
     * This keeps the PDF visually attached
     * to the user's fingers during pinch.
     */
    const documentElement =
      documentRef.current

    const documentRect =
      documentElement
        ?.getBoundingClientRect()

    const transformOriginX =
      documentRect
        ? center.x -
        documentRect.left
        : 0

    const transformOriginY =
      documentRect
        ? center.y -
        documentRect.top
        : 0

    pinchRef.current = {
      startDistance:
        distance,

      startScale:
        renderScaleRef.current,

      pageNumber,

      pageRelativeY:
        Math.max(
          0,
          Math.min(
            1,
            pageRelativeY
          )
        ),

      pageRelativeX:
        Math.max(
          0,
          Math.min(
            1,
            pageRelativeX
          )
        ),

      viewportX:
        center.x,

      viewportY:
        center.y,

      transformOriginX,

      transformOriginY,
    }

    gestureScaleRef.current =
      renderScaleRef.current

    setGestureScale(
      renderScaleRef.current
    )
  }

  /*
   * ─────────────────────────────────────────
   * ACTIVE PINCH
   * ─────────────────────────────────────────
   */

  const handleTouchMove = (
    event: TouchEvent
  ) => {
    if (
      event.touches.length !== 2 ||
      !pinchRef.current
    ) {
      return
    }

    /*
     * Critical:
     *
     * Prevent the browser from
     * interpreting the pinch as
     * normal scrolling.
     */
    event.preventDefault()

    const distance =
      getTouchDistance(
        event.touches
      )

    if (!distance)
      return

    const {
      startDistance,
      startScale,
    } = pinchRef.current

    const rawRatio =
      distance /
      startDistance

    /*
     * Slightly damp the gesture.
     *
     * This removes the "jump from 1x
     * straight to 2x" feeling.
     */
    const adjustedRatio =
      1 +
      (
        rawRatio - 1
      ) *
      PINCH_SENSITIVITY

    const nextScale =
      clampScale(
        startScale *
        adjustedRatio
      )

    gestureScaleRef.current =
      nextScale

    setGestureScale(
      nextScale
    )
  }

  /*
   * ─────────────────────────────────────────
   * FINISH PINCH
   * ─────────────────────────────────────────
   */

  const finishPinch =
    useCallback(() => {

      const finalScale =
        gestureScaleRef.current

      const pinch =
        pinchRef.current

      if (
        finalScale == null ||
        !pinch
      ) {
        pinchRef.current = null
        gestureScaleRef.current = null
        setGestureScale(null)
        return
      }

      const oldScale =
        renderScaleRef.current

      const newScale =
        clampScale(finalScale)

      /*
       * Ignore microscopic changes.
       */
      if (
        Math.abs(
          newScale -
          oldScale
        ) < 0.01
      ) {
        pinchRef.current = null
        gestureScaleRef.current = null
        setGestureScale(null)
        return
      }

      /*
       * Save the exact visual anchor
       * BEFORE React-PDF changes layout.
       */
      pendingAnchorRef.current = {
        pageNumber:
          pinch.pageNumber,

        pageRelativeY:
          pinch.pageRelativeY,

        pageRelativeX:
          pinch.pageRelativeX,

        viewportX:
          pinch.viewportX,

        viewportY:
          pinch.viewportY,

        targetScale:
          newScale,
      }

      /*
       * Clear gesture state.
       */
      pinchRef.current = null
      gestureScaleRef.current = null

      /*
       * Commit the real PDF render.
       */
      renderScaleRef.current =
        newScale

      setRenderScale(
        newScale
      )

      /*
       * Remove temporary visual scaling.
       */
      setGestureScale(null)

      /*
       * Wait until React-PDF has actually
       * resized the target page.
       *
       * We DO NOT assume that two frames
       * are enough.
       */
      const startedAt =
        performance.now()

      const restoreAnchor =
        () => {

          const anchor =
            pendingAnchorRef.current

          if (!anchor)
            return

          const pages =
            Array.from(
              document.querySelectorAll(
                '.react-pdf__Page'
              )
            ) as HTMLElement[]

          const targetPage =
            pages[
            anchor.pageNumber - 1
            ]

          /*
           * PDF page may not exist yet.
           */
          if (!targetPage) {
            if (
              performance.now() -
              startedAt <
              2000
            ) {
              requestAnimationFrame(
                restoreAnchor
              )
            }

            return
          }

          const rect =
            targetPage.getBoundingClientRect()

          /*
           * React-PDF has finished resizing
           * this page when its CSS width
           * matches the requested render width.
           */
          const expectedWidth =
            Math.round(
              pageWidthRef.current *
              anchor.targetScale
            )

          const widthReady =
            Math.abs(
              rect.width -
              expectedWidth
            ) <= 2

          /*
           * If React-PDF is still rebuilding
           * the document, wait.
           */
          if (
            !widthReady
          ) {
            if (
              performance.now() -
              startedAt <
              2000
            ) {
              requestAnimationFrame(
                restoreAnchor
              )
            }

            return
          }

          const viewer =
            viewerRef.current

          /*
           * Calculate the exact point inside
           * the newly-rendered page.
           */
          const targetY =
            rect.top +
            rect.height *
            anchor.pageRelativeY

          const targetX =
            rect.left +
            rect.width *
            anchor.pageRelativeX

          /*
           * Restore vertical position.
           *
           * The same PDF content point
           * returns to the same screen Y.
           */
          window.scrollTo({
            top:
              window.scrollY +
              (
                targetY -
                anchor.viewportY
              ),

            behavior:
              'auto',
          })

          /*
           * Restore horizontal position.
           *
           * This keeps the same content
           * under the user's fingers.
           */
          if (viewer) {
            viewer.scrollLeft +=
              targetX -
              anchor.viewportX
          }

          /*
           * Anchor successfully restored.
           */
          pendingAnchorRef.current =
            null
        }

      /*
       * Start after the next paint.
       *
       * The function itself will keep
       * waiting until the new PDF width
       * actually exists.
       */
      requestAnimationFrame(
        restoreAnchor
      )

    }, [clampScale])

  /*
   * ─────────────────────────────────────────
   * TOUCH END / CANCEL
   * ─────────────────────────────────────────
   */

  const handleTouchEnd = () => {
    if (
      pinchRef.current
    ) {
      finishPinch()
    }
  }

  /*
   * ─────────────────────────────────────────
   * TOUCH LISTENERS
   * ─────────────────────────────────────────
   */

  useEffect(() => {
    const viewer =
      viewerRef.current

    if (!viewer)
      return

    viewer.addEventListener(
      'touchstart',
      handleTouchStart,
      {
        passive: true,
      }
    )

    viewer.addEventListener(
      'touchmove',
      handleTouchMove,
      {
        passive: false,
      }
    )

    viewer.addEventListener(
      'touchend',
      handleTouchEnd,
      {
        passive: true,
      }
    )

    viewer.addEventListener(
      'touchcancel',
      handleTouchEnd,
      {
        passive: true,
      }
    )

    return () => {
      viewer.removeEventListener(
        'touchstart',
        handleTouchStart
      )

      viewer.removeEventListener(
        'touchmove',
        handleTouchMove
      )

      viewer.removeEventListener(
        'touchend',
        handleTouchEnd
      )

      viewer.removeEventListener(
        'touchcancel',
        handleTouchEnd
      )
    }
  }, [])

  /*
   * ─────────────────────────────────────────
   * RESET WHEN PDF CHANGES
   * ─────────────────────────────────────────
   */

  useEffect(() => {
    renderScaleRef.current = 1

    gestureScaleRef.current =
      null

    pinchRef.current = null

    pendingAnchorRef.current =
      null

    setRenderScale(1)
    setGestureScale(null)
    setLoaded(false)
  }, [fileUrl])

  /*
   * ─────────────────────────────────────────
   * DESKTOP CTRL/CMD + WHEEL
   * ─────────────────────────────────────────
   */

  const handleWheel = (
    event: React.WheelEvent
  ) => {
    if (
      !event.ctrlKey &&
      !event.metaKey
    ) {
      return
    }

    event.preventDefault()

    const direction =
      event.deltaY < 0
        ? 1.08
        : 0.92

    const nextScale =
      clampScale(
        renderScaleRef.current *
        direction
      )

    if (
      Math.abs(
        nextScale -
        renderScaleRef.current
      ) < 0.01
    ) {
      return
    }

    renderScaleRef.current =
      nextScale

    setRenderScale(
      nextScale
    )
  }

  /*
   * ─────────────────────────────────────────
   * REAL PDF WIDTH
   * ─────────────────────────────────────────
   */

  const renderWidth =
    Math.round(
      pageWidth *
      renderScale
    )

  /*
   * During pinch, visually scale the
   * already-rendered PDF.
   *
   * This is what makes the gesture smooth.
   *
   * Once pinch ends, React-PDF renders
   * the actual higher-resolution canvas.
   */
  const visualScale =
    gestureScale != null
      ? gestureScale /
      renderScale
      : 1

  /*
   * ─────────────────────────────────────────
   * RENDER
   * ─────────────────────────────────────────
   */

  return (
    <div
      ref={viewerRef}
      onWheel={handleWheel}
      style={{
        width: '100%',

        /*
         * The viewer becomes the horizontal
         * scroll surface when the PDF is zoomed.
         */
        overflowX:
          renderWidth > pageWidth
            ? 'auto'
            : 'hidden',

        /*
         * Do not create a separate vertical
         * scroll container here.
         *
         * Vertical scrolling belongs to the
         * page/document itself.
         */
        overflowY: 'visible',

        /*
         * IMPORTANT:
         *
         * pan-x = allows one-finger horizontal
         * dragging across a zoomed PDF.
         *
         * pan-y = keeps normal vertical reading.
         *
         * pinch-zoom = allows multi-touch gestures.
         */
        touchAction:
          'pan-x pan-y pinch-zoom',

        WebkitOverflowScrolling:
          'touch',

        overscrollBehaviorX:
          'contain',

        boxSizing:
          'border-box',
      }}
    >

      {!loaded && (
        <div
          style={{
            minHeight: '75vh',

            display: 'flex',
            flexDirection:
              'column',

            alignItems:
              'center',

            justifyContent:
              'center',

            color:
              '#111827',
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,

              borderRadius: 22,

              background:
                '#F9FAFB',

              border:
                '1px solid #E5E7EB',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              fontSize: 42,

              marginBottom: 22,
            }}
          >
            📄
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Preparing document...
          </div>

          <div
            style={{
              marginTop: 8,

              color:
                '#6B7280',

              fontSize: 15,
            }}
          >
            Please wait a moment
          </div>
        </div>
      )}

      <div
        ref={documentRef}
        style={{
          opacity:
            loaded ? 1 : 0,

          transition:
            'opacity .25s ease',

          /*
           * The actual layout width follows
           * the real PDF render width.
           */
          width:
            Math.max(
              pageWidth,
              renderWidth
            ),

          minWidth:
            '100%',

          boxSizing:
            'border-box',

          display:
            'flex',

          justifyContent:
            'center',

          /*
           * Temporary pinch zoom.
           *
           * This does NOT trigger a PDF
           * re-render.
           */
          transform:
            visualScale !== 1
              ? `scale(${visualScale})`
              : 'none',

          transformOrigin:
            pinchRef.current
              ? `${pinchRef.current.transformOriginX}px ${pinchRef.current.transformOriginY}px`
              : 'top left',

          willChange:
            gestureScale != null
              ? 'transform'
              : 'auto',
        }}
      >

        <Document
          file={fileUrl}
          loading={null}
          error="Failed to load PDF."

          onLoadSuccess={({
            numPages,
          }) => {
            setNumPages(
              numPages
            )
          }}
        >

          {Array.from(
            {
              length: numPages,
            },
            (_, index) => {
              const pageNumber =
                index + 1

              const shouldRender =
                renderedPages.has(
                  pageNumber
                )

              return (
                <div
                  key={pageNumber}
                  ref={(element) => {
                    if (!element)
                      return

                    /*
                     * Start rendering a page when it
                     * approaches the viewport.
                     *
                     * 1200px gives us a comfortable
                     * preload buffer without rendering
                     * the entire PDF immediately.
                     */
                    const observer =
                      new IntersectionObserver(
                        (entries) => {
                          const entry =
                            entries[0]

                          if (
                            entry?.isIntersecting
                          ) {
                            setRenderedPages(
                              (current) => {
                                if (
                                  current.has(
                                    pageNumber
                                  )
                                ) {
                                  return current
                                }

                                const next =
                                  new Set(
                                    current
                                  )

                                next.add(
                                  pageNumber
                                )

                                return next
                              }
                            )

                            observer.disconnect()

                            pageObserversRef.current.delete(
                              pageNumber
                            )
                          }
                        },
                        {
                          root: null,

                          rootMargin:
                            '1200px 0px',

                          threshold: 0,
                        }
                      )

                    observer.observe(
                      element
                    )

                    pageObserversRef.current.set(
                      pageNumber,
                      observer
                    )
                  }}
                  style={{
                    marginBottom: 18,

                    display: 'flex',

                    justifyContent:
                      'center',

                    width: '100%',

                    /*
                     * Keep document height stable
                     * before the real page renders.
                     *
                     * A4 ratio gives us a sensible
                     * placeholder for most documents.
                     */
                    minHeight:
                      shouldRender
                        ? undefined
                        : Math.round(
                          renderWidth *
                          1.414
                        ),
                  }}
                >
                  {shouldRender ? (
                    <Page
                      pageNumber={
                        pageNumber
                      }

                      width={
                        renderWidth
                      }

                      devicePixelRatio={
                        typeof window !==
                          'undefined'
                          ? Math.min(
                            window.devicePixelRatio ||
                            1,
                            3
                          )
                          : 1
                      }

                      renderTextLayer

                      renderAnnotationLayer

                      loading={
                        <div
                          style={{
                            width:
                              renderWidth,

                            minHeight:
                              Math.round(
                                renderWidth *
                                1.414
                              ),

                            background:
                              '#FFFFFF',
                          }}
                        />
                      }

                      onRenderSuccess={() => {
                        if (
                          !loaded &&
                          pageNumber === 1
                        ) {
                          setLoaded(true)

                          window.dispatchEvent(
                            new Event(
                              'ep-reader-ready'
                            )
                          )
                        }
                      }}
                    />
                  ) : null}
                </div>
              )
            }
          )}

        </Document>

      </div>
    </div>
  )
}