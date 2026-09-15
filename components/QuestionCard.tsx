'use client'

import { useRouter } from 'next/navigation'
import {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react'
import { markHelpful, markNotUseful } from '@/lib/feedPrefs'
import LinkPreviewCard from './LinkPreviewCard'
import QuestionActionsMenu from './QuestionActionsMenu'
import { supabase } from '@/lib/supabase'
import { useShare }
from '@/contexts/ShareContext'
import { useNavigation } from '@/components/navigation/NavigationProvider'

type Props = {
  q: {
    id: string
    text: string
    text_rich?: unknown
    created_at: string
    expires_at?: string
    type?: 'normal' | 'bubble'
    answers_count?: number
    category_label?: string
    user_name?: string
    username?: string
    avatar_url?: string
    is_verified?: boolean
    streak_count?: number
    is_trending?: boolean
    _missed?: boolean
    hideStreak?: boolean
    is_friend?: boolean
    user_id?: string
    link_url?: string
link_title?: string
link_description?: string
link_image?: string
link_domain?: string
link_type?: string
helpful_count?: number
is_helpful?: boolean
  }
  currentUserId?: string | null

  onDelete?: (id: string) => void
}

const HELPFUL_QUEUE_KEY = 'ep_pending_helpful_actions'

type PendingHelpfulAction = {
  questionId: string
  userId: string
  desired: boolean
}

function getHelpfulQueue(): PendingHelpfulAction[] {
  try {
    const raw = localStorage.getItem(HELPFUL_QUEUE_KEY)

    if (!raw) return []

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch {
    return []
  }
}

function saveHelpfulQueue(
  queue: PendingHelpfulAction[]
) {
  try {
    if (queue.length === 0) {
      localStorage.removeItem(
        HELPFUL_QUEUE_KEY
      )
      return
    }

    localStorage.setItem(
      HELPFUL_QUEUE_KEY,
      JSON.stringify(queue)
    )
  } catch {}
}

function queueHelpfulAction(
  action: PendingHelpfulAction
) {
  const queue = getHelpfulQueue()

  const existingIndex =
    queue.findIndex(
      item =>
        item.questionId === action.questionId &&
        item.userId === action.userId
    )

  if (existingIndex >= 0) {
    queue[existingIndex] = action
  } else {
    queue.push(action)
  }

  saveHelpfulQueue(queue)
}

function removeHelpfulAction(
  questionId: string,
  userId: string
) {
  const queue = getHelpfulQueue()

  saveHelpfulQueue(
    queue.filter(
      item =>
        !(
          item.questionId === questionId &&
          item.userId === userId
        )
    )
  )
}

function formatTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

type RichNode = {
  type?: string
  text?: string
  format?: number
  url?: string
  children?: RichNode[]
}

function parseRichContent(
  value: unknown
): RichNode | null {
  if (!value) return null

  try {
    const parsed =
      typeof value === 'string'
        ? JSON.parse(value)
        : value

    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      return null
    }

    const root =
      (parsed as {
        root?: unknown
      }).root

    if (
      root &&
      typeof root === 'object'
    ) {
      return root as RichNode
    }

    return parsed as RichNode
  } catch {
    return null
  }
}

function truncateRichContent(
  content: RichNode,
  maxChars: number
): RichNode {
  let remaining = Math.max(
    0,
    maxChars
  )

  const walk = (
    node: RichNode
  ): RichNode | null => {
    if (
      node.type === 'text'
    ) {
      if (remaining <= 0) {
        return null
      }

      const value =
        node.text || ''

      const sliced =
        value.slice(
          0,
          remaining
        )

      remaining -= sliced.length

      return {
        ...node,
        text: sliced,
      }
    }

    if (
      Array.isArray(
        node.children
      )
    ) {
      const children: RichNode[] = []

      for (
        const child of node.children
      ) {
        if (remaining <= 0) {
          break
        }

        const result =
          walk(child)

        if (result) {
          children.push(result)
        }
      }

      return {
        ...node,
        children,
      }
    }

    return {
      ...node,
    }
  }

  return (
    walk(content) || {
      type: 'root',
      children: [],
    }
  )
}

function renderRichNodes(
  nodes: RichNode[],
  onLinkClick: (
    href: string
  ) => void,
  keyPrefix = '',
  insideLink = false
): React.ReactNode[] {
  return nodes.flatMap<React.ReactNode>(
    (node, index) => {
      const key =
        `${keyPrefix}-${index}`

      if (
        node.type === 'text'
      ) {
        const value =
          node.text || ''

        const format =
          node.format ?? 0

          console.log('🔥 FEED RICH NODE:', {
  text: value,
  format,
})

        const text =
          insideLink
            ? value
                .replace(
                  /^https?:\/\//i,
                  ''
                )
                .replace(
                  /^www\./i,
                  ''
                )
                .replace(
                  /\/$/,
                  ''
                )
            : value

        const textDecoration = [
          format & 8
            ? 'underline'
            : '',
          format & 4
            ? 'line-through'
            : undefined,
        ]
          .filter(Boolean)
          .join(' ')

        const style: React.CSSProperties = {
          fontWeight:
  format & 1
    ? 600
    : undefined,

          fontStyle:
            format & 2
              ? 'italic'
              : undefined,

          textDecoration:
            textDecoration ||
            undefined,

          fontFamily:
            format & 16
              ? 'monospace'
              : undefined,

          verticalAlign:
            format & 32
              ? 'sub'
              : format & 64
              ? 'super'
              : undefined,

          background:
            format & 128
              ? '#FFF3CD'
              : undefined,

          borderRadius:
            format & 128
              ? 3
              : undefined,
        }

        const TextTag =
  format & 4
    ? 's'
    : 'span'

return [
  <TextTag
    key={key}
    style={style}
  >
    {text}
  </TextTag>,
]
      }

      if (
        node.type === 'linebreak'
      ) {
        return [
          <br
            key={key}
          />,
        ]
      }

      if (
        node.type === 'link' ||
        node.type === 'autolink'
      ) {
        const href =
          node.url || ''

        if (!href) {
          return renderRichNodes(
            node.children || [],
            onLinkClick,
            key,
            true
          )
        }

        return [
          <span
            key={key}
            onClick={(e) => {
              e.stopPropagation()

              onLinkClick(href)
            }}
            style={{
  display: 'block',

  maxWidth: '100%',

  overflow: 'hidden',

  textOverflow: 'ellipsis',

  whiteSpace: 'nowrap',

  color: '#1D9BF0',

  cursor: 'pointer',

  wordBreak: 'normal',

  overflowWrap: 'normal',

  textDecoration: 'none',

  transition:
    'opacity 0.12s ease',
}}
          >
            {renderRichNodes(
              node.children || [],
              onLinkClick,
              key,
              true
            )}
          </span>,
        ]
      }

      if (
        node.type === 'paragraph'
      ) {
        return [
          ...renderRichNodes(
            node.children || [],
            onLinkClick,
            key,
            insideLink
          ),
        ]
      }

      if (
        Array.isArray(
          node.children
        )
      ) {
        return renderRichNodes(
          node.children,
          onLinkClick,
          key,
          insideLink
        )
      }

      return []
    }
  )
}

export default function QuestionCard({
  q,
  currentUserId,
  onDelete,
}: Props){
  const router = useRouter()

const {
  setShareData,
  shareRendererRef,
} = useShare()
  
  const {
  open,
  openProfile,
  openQuestion,
} = useNavigation()
  const [popped, setPopped] = useState(false)
  const menuButtonRef =
  useRef<HTMLButtonElement>(null)
  const [showMenu, setShowMenu] =
  useState(false)

  useEffect(() => {
  return () => {
    setPopped(false)
  }
}, [])

  const [feedback, setFeedback] =
    useState<'up' | 'down' | null>(null)
  
    const [helpfulCount, setHelpfulCount] =
  useState(q.helpful_count ?? 0)

const [isHelpful, setIsHelpful] =
  useState(q.is_helpful ?? false)

const [helpfulAnimating, setHelpfulAnimating] =
  useState(false)

const helpfulSyncingRef =
  useRef(false)

const helpfulDesiredRef =
  useRef(q.is_helpful ?? false)

const [saved, setSaved] =
  useState(false)

const [showShareMenu, setShowShareMenu] =
  useState(false)

const [isTextExpanded, setIsTextExpanded] =
  useState(false)

const [isTextLong, setIsTextLong] =
  useState(false)

const [displayText, setDisplayText] =
  useState('')

const [collapsedText, setCollapsedText] =
  useState('')

const textRef =
  useRef<HTMLParagraphElement>(null)

  const [shareMenuPlacement, setShareMenuPlacement] =
  useState<'up' | 'down'>('up')

const shareButtonRef =
  useRef<HTMLDivElement>(null)

const shareMenuRef =
  useRef<HTMLDivElement>(null)

useLayoutEffect(() => {
  if (!showShareMenu) return

  const calculateShareMenuPosition = () => {
    const button =
      shareButtonRef.current

    const menu =
      shareMenuRef.current

    if (!button || !menu) return

    const buttonRect =
      button.getBoundingClientRect()

    const menuRect =
      menu.getBoundingClientRect()

    const gap = 8

    const spaceAbove =
      buttonRect.top - 42

    const spaceBelow =
      window.innerHeight -
      buttonRect.bottom -
      42

    /*
     * Prefer UP whenever there is enough room.
     *
     * If there isn't enough room above,
     * automatically open DOWN.
     */
    if (
      spaceAbove >=
      menuRect.height + gap
    ) {
      setShareMenuPlacement('up')
    } else {
      setShareMenuPlacement('down')
    }
  }

  /*
   * Wait until the menu has actually rendered
   * so we can measure its real height.
   */
  requestAnimationFrame(
    calculateShareMenuPosition
  )
}, [showShareMenu])

 const goToQuestion = () => {
  // 🔥 BLOCK navigation while menu is open
  if (showMenu || showShareMenu) return

  // 🔥 prevent spam taps
  if (popped) return

  // 🔥 instant visual feedback
  setPopped(true)

  // 🔥 save scroll
  sessionStorage.setItem(
    'feed_scroll',
    String(window.scrollY)
  )

  // 🔥 cache preview
  sessionStorage.setItem(
    `question-preview-${q.id}`,
    JSON.stringify(q)
  )

  // 🔥 bubble sound
  if (q.type === 'bubble') {
    try {
      const audio = new Audio('/pop.mp3')

      audio.volume = 0.15

      setTimeout(() => {
        audio.play().catch(() => {})
      }, 0)
    } catch {}
  }

  // 🔥 slight delay for tap animation
setTimeout(() => {
  setPopped(false)

  openQuestion(q.id)
}, 85)
}

  const hasAnswers =
    (q.answers_count ?? 0) > 0

const actionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  gap: 4,

  flex: 1,

  padding: '6px 4px',

  borderRadius: 8,

  cursor: 'pointer',

  color: '#6B7280',

  fontSize: 12,

  fontWeight: 500,

  userSelect: 'none',

  WebkitTapHighlightColor:
    'transparent',
} as const


const syncHelpful = async () => {
  if (!currentUserId) return

  /*
   * Prevent two sync loops from running at once.
   */
  if (helpfulSyncingRef.current) {
    return
  }

  helpfulSyncingRef.current = true

  try {
    /*
     * Always use the latest desired state.
     */
    const desired =
      helpfulDesiredRef.current

    if (desired) {
      const { error } =
        await supabase
          .from('question_likes')
          .upsert(
            {
              question_id: q.id,
              user_id: currentUserId,
            },
            {
              onConflict:
                'question_id,user_id',
            }
          )

      if (error) {
        throw error
      }

      /*
       * 🔔 Notify question owner
       */
      if (
        q.user_id &&
        q.user_id !== currentUserId
      ) {
        const { data: me } =
          await supabase
            .from('profiles')
            .select('name, username')
            .eq(
              'user_id',
              currentUserId
            )
            .single()

        await supabase
          .from('notifications')
          .insert({
            user_id: q.user_id,
            actor_id: currentUserId,
            type: 'question_like',
            message:
              q.text.length > 80
                ? `${q.text.slice(0, 80)}...`
                : q.text,
            link:
              `/question/${q.id}`,
            is_read: false,
          })

        try {
          await fetch(
            '/api/push/send',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                userId:
                  q.user_id,
                title:
                  `❤️ ${me?.name || me?.username || 'Someone'} liked your question`,
                message:
                  q.text.length > 80
                    ? `${q.text.slice(0, 80)}...`
                    : q.text,
                url:
                  `/question/${q.id}`,
              }),
            }
          )
        } catch {}
      }

    } else {

      const { error } =
        await supabase
          .from('question_likes')
          .delete()
          .eq(
            'question_id',
            q.id
          )
          .eq(
            'user_id',
            currentUserId
          )

      if (error) {
        throw error
      }
    }

    /*
     * Only remove the local request AFTER
     * Supabase successfully accepted it.
     */
    const latestDesired =
      helpfulDesiredRef.current

    if (
      latestDesired === desired
    ) {
      removeHelpfulAction(
        q.id,
        currentUserId
      )
    }

    /*
     * If the user changed their mind while the
     * previous request was running, sync again.
     */
    if (
      latestDesired !== desired
    ) {
      helpfulSyncingRef.current =
        false

      await syncHelpful()

      return
    }

  } catch {
    /*
     * Keep the action queued.
     */
    queueHelpfulAction({
      questionId: q.id,
      userId: currentUserId,
      desired:
        helpfulDesiredRef.current,
    })

  } finally {
    helpfulSyncingRef.current =
      false
  }
}


const toggleHelpful = async (
  e: React.MouseEvent
) => {
  e.preventDefault()
  e.stopPropagation()

  if (!currentUserId) return

  const nextState =
    !isHelpful

  /*
   * Keep the latest user intention.
   */
  helpfulDesiredRef.current =
    nextState

  /*
   * Optimistic UI.
   */
  setIsHelpful(nextState)

  setHelpfulCount(prev =>
    nextState
      ? prev + 1
      : Math.max(0, prev - 1)
  )

  /*
   * Tap animation.
   */
  if (nextState) {
  setHelpfulAnimating(true)

  window.setTimeout(() => {
    setHelpfulAnimating(false)
  }, 420)
}

  window.setTimeout(() => {
    setHelpfulAnimating(false)
  }, 420)

  /*
   * Save intended request locally BEFORE
   * contacting Supabase.
   */
  queueHelpfulAction({
    questionId: q.id,
    userId: currentUserId,
    desired: nextState,
  })

  /*
   * Immediately try to sync.
   */
  await syncHelpful()
}


/*
 * Retry queued Helpful actions.
 *
 * IMPORTANT:
 * This hook MUST be at the component's top level.
 */
useEffect(() => {
  if (!currentUserId) return

  const retryPendingHelpful =
    async () => {
      const queue =
        getHelpfulQueue()

      const pending =
        queue.find(
          item =>
            item.questionId === q.id &&
            item.userId ===
              currentUserId
        )

      if (!pending) return

      /*
       * Restore optimistic state.
       */
      helpfulDesiredRef.current =
        pending.desired

      setIsHelpful(
        pending.desired
      )

      /*
       * Sync with Supabase.
       */
      await syncHelpful()
    }

  /*
   * Retry when browser comes online.
   */
  window.addEventListener(
    'online',
    retryPendingHelpful
  )

  /*
   * Retry when returning to tab.
   */
  document.addEventListener(
    'visibilitychange',
    retryPendingHelpful
  )

  /*
   * Background retry.
   */
  const interval =
    window.setInterval(
      retryPendingHelpful,
      15000
    )

  /*
   * Try once immediately.
   */
  retryPendingHelpful()

  return () => {
    window.removeEventListener(
      'online',
      retryPendingHelpful
    )

    document.removeEventListener(
      'visibilitychange',
      retryPendingHelpful
    )

    window.clearInterval(
      interval
    )
  }
}, [
  q.id,
  currentUserId,
])

useEffect(() => {
  if (!showShareMenu) return

  const closeMenu = () => {
    setShowShareMenu(false)
  }

  // Close when scrolling
  window.addEventListener('scroll', closeMenu, {
    passive: true,
  })

  // Close when clicking anywhere outside
  document.addEventListener(
  'click',
  closeMenu
)

  // Close when navigating away
  window.addEventListener(
    'popstate',
    closeMenu
  )

  return () => {
    window.removeEventListener(
      'scroll',
      closeMenu
    )

    document.removeEventListener(
  'click',
  closeMenu
)

    window.removeEventListener(
      'popstate',
      closeMenu
    )
  }
}, [showShareMenu])

useEffect(() => {
  const handler = (
    e: Event
  ) => {
    const id = (
      e as CustomEvent
    ).detail

    if (id !== q.id) {
      setShowShareMenu(false)
    }

    /*
     * If another card opens Share,
     * also close this card's More menu.
     */
    if (id !== q.id) {
      setShowMenu(false)
    }
  }

  window.addEventListener(
    'ep-share-open',
    handler
  )

  return () => {
    window.removeEventListener(
      'ep-share-open',
      handler
    )
  }
}, [q.id])

useEffect(() => {
  /*
   * Close this menu when:
   * 1. Another question's More menu opens
   * 2. User scrolls
   * 3. User navigates away
   */

  const handleOtherMenuOpen = (
    e: Event
  ) => {
    const customEvent =
      e as CustomEvent

    const openedQuestionId =
      customEvent.detail

    if (
      openedQuestionId !== q.id
    ) {
      setShowMenu(false)
    }
  }

  const closeOnScroll = () => {
    setShowMenu(false)
  }

  const closeOnNavigation = () => {
    setShowMenu(false)
  }

  window.addEventListener(
    'ep-question-menu-open',
    handleOtherMenuOpen
  )

  window.addEventListener(
    'scroll',
    closeOnScroll,
    {
      passive: true,
    }
  )

  window.addEventListener(
    'popstate',
    closeOnNavigation
  )

  return () => {
    window.removeEventListener(
      'ep-question-menu-open',
      handleOtherMenuOpen
    )

    window.removeEventListener(
      'scroll',
      closeOnScroll
    )

    window.removeEventListener(
      'popstate',
      closeOnNavigation
    )
  }
}, [q.id])

useEffect(() => {
  if (!currentUserId) return

  const loadSaved = async () => {
    const { data } = await supabase
      .from('question_saves')
      .select('id')
      .eq('question_id', q.id)
      .eq('user_id', currentUserId)
      .maybeSingle()

    setSaved(!!data)
  }

  loadSaved()
}, [q.id, currentUserId])

useEffect(() => {
  if (!currentUserId) return

  let cancelled = false

  const loadHelpfulState = async () => {
    /*
     * First respect a locally queued action.
     *
     * This prevents a failed Supabase request from
     * immediately making the UI look unhelpful again.
     */
    const queue = getHelpfulQueue()

    const pending = queue.find(
      item =>
        item.questionId === q.id &&
        item.userId === currentUserId
    )

    if (pending) {
      helpfulDesiredRef.current =
        pending.desired

      setIsHelpful(
        pending.desired
      )

      return
    }

    /*
     * Ask Supabase for the real current state.
     *
     * This fixes stale q.is_helpful values coming
     * from an older feed/cache response.
     */
    const { data, error } =
      await supabase
        .from('question_likes')
        .select('id')
        .eq('question_id', q.id)
        .eq('user_id', currentUserId)
        .maybeSingle()

    if (
      cancelled ||
      error
    ) {
      return
    }

    const serverState =
      !!data

    helpfulDesiredRef.current =
      serverState

    setIsHelpful(
      serverState
    )
  }

  loadHelpfulState()

  return () => {
    cancelled = true
  }
}, [
  q.id,
  currentUserId,
])

useLayoutEffect(() => {
  const element = textRef.current

  if (!element) return

  /*
   * Keep the exact same text-cleaning rules
   * already used by QuestionCard.
   */
  const cleanText =
  (q.text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/g, '')
    .replace(
      /\bhttps?:\/\/https?:\/\//gi,
      'https://'
    )

setDisplayText(cleanText)

/*
 * A post that is only a URL should NEVER use
 * the normal question "Read more" system.
 *
 * Long URLs are visually truncated with CSS instead.
 */
const isUrlOnly =
  /^(?:https?:\/\/|www\.)[^\s]+$/i.test(
    cleanText
  ) ||
  /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/i.test(
    cleanText
  )

if (isUrlOnly) {
  setIsTextLong(false)
  setCollapsedText(cleanText)
  return
}

  /*
   * Nothing to measure yet if there is no text.
   */
  if (!cleanText) {
    setIsTextLong(false)
    setCollapsedText('')
    return
  }

  const checkTextHeight = () => {
    /*
     * Make sure the real paragraph has its
     * current responsive width.
     */
    const width =
      element.getBoundingClientRect().width

    if (!width) return

    const lineHeight = 1.55
    const fontSize = 16

    const maxHeight =
      fontSize *
      lineHeight *
      5

    /*
     * ------------------------------------------------
     * STEP 1
     * ------------------------------------------------
     * Determine whether the COMPLETE post is longer
     * than five lines.
     */
    const fullMeasure =
      document.createElement('div')

    const computed =
      window.getComputedStyle(element)

    fullMeasure.style.position =
      'absolute'

    fullMeasure.style.visibility =
      'hidden'

    fullMeasure.style.pointerEvents =
      'none'

    fullMeasure.style.left =
      '-99999px'

    fullMeasure.style.top =
      '0'

    fullMeasure.style.width =
      `${width}px`

    fullMeasure.style.fontFamily =
      computed.fontFamily

    fullMeasure.style.fontSize =
      computed.fontSize

    fullMeasure.style.fontWeight =
      computed.fontWeight

    fullMeasure.style.lineHeight =
      computed.lineHeight

    fullMeasure.style.letterSpacing =
      computed.letterSpacing

    fullMeasure.style.whiteSpace =
      'pre-wrap'

    fullMeasure.style.wordBreak =
      'break-word'

    fullMeasure.style.overflowWrap =
      'anywhere'

    fullMeasure.textContent =
      cleanText

    document.body.appendChild(
      fullMeasure
    )

    const fullHeight =
      fullMeasure.scrollHeight

    document.body.removeChild(
      fullMeasure
    )

    const long =
      fullHeight >
      maxHeight + 2

    setIsTextLong(long)

    /*
     * Short post:
     * no truncation and no Read more.
     */
    if (!long) {
      setCollapsedText(cleanText)
      return
    }

    /*
     * ------------------------------------------------
     * STEP 2
     * ------------------------------------------------
     * Measure the actual collapsed version.
     *
     * The suffix is included in the measurement.
     * Therefore Read more can NEVER overlap the text.
     */
    const measure =
      document.createElement('div')

    measure.style.position =
      'absolute'

    measure.style.visibility =
      'hidden'

    measure.style.pointerEvents =
      'none'

    measure.style.left =
      '-99999px'

    measure.style.top =
      '0'

    measure.style.width =
      `${width}px`

    measure.style.fontFamily =
      computed.fontFamily

    measure.style.fontSize =
      computed.fontSize

    measure.style.fontWeight =
      computed.fontWeight

    measure.style.lineHeight =
      computed.lineHeight

    measure.style.letterSpacing =
      computed.letterSpacing

    measure.style.whiteSpace =
      'pre-wrap'

    measure.style.wordBreak =
      'break-word'

    measure.style.overflowWrap =
      'anywhere'

    document.body.appendChild(
      measure
    )

    /*
     * This is the exact text that will appear
     * after the truncated portion.
     */
    const suffix =
      '... Read more'

    let low = 0
    let high = cleanText.length

    let best = ''

    /*
     * Binary search for the largest amount
     * of text that still fits inside five lines.
     */
    while (low <= high) {
      const middle =
        Math.floor(
          (low + high) / 2
        )

      let candidate =
        cleanText.slice(
          0,
          middle
        )

      /*
       * Only cut at a word boundary.
       *
       * This prevents:
       *
       * "navigation is bett... Read more"
       *
       * and instead gives:
       *
       * "navigation is ... Read more"
       */
      if (
        middle <
        cleanText.length
      ) {
        const lastSpace =
          candidate.lastIndexOf(' ')

        if (lastSpace > 0) {
          candidate =
            candidate.slice(
              0,
              lastSpace
            )
        }
      }

      candidate =
        candidate.replace(
          /\s+$/,
          ''
        )

      measure.textContent =
        `${candidate}${suffix}`

      if (
        measure.scrollHeight <=
        maxHeight + 2
      ) {
        best = candidate

        low =
          middle + 1
      } else {
        high =
          middle - 1
      }
    }

    /*
     * Safety fallback.
     */
    if (!best) {
      best =
        cleanText.slice(
          0,
          Math.max(
            1,
            Math.floor(
              cleanText.length * 0.4
            )
          )
        )
          .replace(
            /\s+\S*$/,
            ''
          )
          .replace(
            /\s+$/,
            ''
          )
    }

    setCollapsedText(best)

    document.body.removeChild(
      measure
    )
  }

  /*
   * Wait one animation frame so the paragraph
   * has its real responsive width.
   */
  const frame =
    requestAnimationFrame(
      checkTextHeight
    )

  const resizeObserver =
    new ResizeObserver(
      checkTextHeight
    )

  resizeObserver.observe(
    element
  )

  window.addEventListener(
    'resize',
    checkTextHeight
  )

  return () => {
    cancelAnimationFrame(frame)

    resizeObserver.disconnect()

    window.removeEventListener(
      'resize',
      checkTextHeight
    )
  }
}, [q.text])

const toggleSave = async (
  e: React.MouseEvent
) => {
  e.preventDefault()
  e.stopPropagation()

  if (!currentUserId) return

  const next = !saved

  setSaved(next)

  try {
    if (next) {
      const { error } = await supabase
        .from('question_saves')
        .insert({
          question_id: q.id,
          user_id: currentUserId,
        })

      if (error) throw error

      // 🔔 Notify question owner
      if (q.user_id && q.user_id !== currentUserId) {
        const { data: me } = await supabase
          .from('profiles')
          .select('name, username')
          .eq('user_id', currentUserId)
          .single()

        await supabase
          .from('notifications')
          .insert({
            user_id: q.user_id,
            actor_id: currentUserId,

            type: 'question_save',

            message:
              q.text.length > 80
                ? `${q.text.slice(0, 80)}...`
                : q.text,

            link: `/question/${q.id}`,

            is_read: false,
          })

        try {
          await fetch('/api/push/send', {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              userId: q.user_id,

              title: `🔖 ${me?.name || me?.username || 'Someone'} saved your question`,

              message: 'Your question was saved.',

              url: `/question/${q.id}`,
            }),
          })
        } catch {}
      }

    } else {

      const { error } = await supabase
        .from('question_saves')
        .delete()
        .eq('question_id', q.id)
        .eq('user_id', currentUserId)

      if (error) throw error
    }

  } catch {
    setSaved(!next)
  }
}

const handleImageShare = async () => {

  setShareData({
    question: q.text,
    creator: q.user_name || "Anonymous",
    username: q.username || "user",
    helpfulCount,
    answersCount: q.answers_count ?? 0,
  })

  await new Promise(resolve =>
    requestAnimationFrame(() =>
      requestAnimationFrame(resolve)
    )
  )

await shareRendererRef.current?.captureShare()

}

  return (
  <div
  role="button"
  tabIndex={0}
  onClick={goToQuestion}
  onKeyDown={(e) => {
    if (e.key === 'Enter') goToQuestion()
  }}
  onPointerDown={(e) => {
  if (e.pointerType !== 'touch') {
    setPopped(true)
  }
}}

onPointerUp={() => setPopped(false)}

onPointerLeave={() => setPopped(false)}

onPointerCancel={() => setPopped(false)}
  style={{
  marginBottom: 0,

  padding: '16px 0 12px',

  borderRadius: 0,

  border: 'none',

  backgroundColor:
    popped
      ? 'rgba(15,20,25,0.02)'
      : q.type === 'bubble'
      ? '#F8FAFC'
      : 'transparent',

boxShadow: 'none',

transform: popped
  ? 'scale(0.996)'
  : 'scale(1)',

opacity: 1,

transition:
  'transform 120ms ease, background-color 120ms ease',

    borderBottom:
      q.type === 'bubble'
        ? '1px dashed #E5E7EB'
        : '1px solid rgba(15, 20, 25, 0.08)',

    backgroundClip: 'padding-box',

    cursor: 'default',

    position: 'relative',

/*
 * When Share is open, lift the ENTIRE card above
 * neighboring QuestionCards.
 *
 * QuestionCard uses transform, which creates its
 * own stacking context, so raising only the menu
 * itself is not enough.
 */
zIndex: showShareMenu ? 1000 : 'auto',

animation: undefined,

    WebkitTapHighlightColor:
      'transparent',
  }}
>

    {/* HEADER */}
<div
  style={{
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  }}
>
  {/* AVATAR */}
  <div
    onClick={(e) => {
      e.stopPropagation()

      if (q.username) {
        openProfile(q.username)
      }
    }}
    style={{
      width: 38,
      height: 38,
      borderRadius: '50%',
      backgroundImage: `url(${q.avatar_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  />

  {/* RIGHT CONTENT COLUMN */}
  <div
    style={{
      flex: 1,
      minWidth: 0,
    }}
  >
    {/* TOP ROW */}
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
        minWidth: 0,
      }}
    >
      {/* NAME + STREAK */}
      <div
        onClick={(e) => {
          e.stopPropagation()

          if (q.username) {
            openProfile(q.username)
          }
        }}
        style={{
          fontWeight: 600,
          fontSize: 14.5,
          letterSpacing: '-0.15px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          minWidth: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Display Name */}
        <span>
          {q.user_name || 'Anonymous'}
        </span>

        {/* Verified */}
        {q.is_verified && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(1px)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                fill="#1D9BF0"
                d="
                  M12 2.5
                  L13.8 4.2 L16.2 3.8 L17 6.2 L19.4 7 L19 9.4
                  L20.5 11.5 L19 13.6 L19.4 16 L17 16.8
                  L16.2 19.2 L13.8 18.8 L12 20.5
                  L10.2 18.8 L7.8 19.2 L7 16.8 L4.6 16
                  L5 13.6 L3.5 11.5 L5 9.4
                  L4.6 7 L7 6.2 L7.8 3.8 L10.2 4.2 Z
                "
              />

              <path
                d="M8.6 11.7l2.4 2.4 4.8-4.8"
                fill="none"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}

        {/* Streak */}
        {!q.hideStreak &&
          (q.is_friend || q.user_id === currentUserId) && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginLeft: 7,
                marginRight: 10,
                padding: '2px 9px 2px 7px',
                minWidth: 42,
                height: 26,
                borderRadius: 999,
                background: '#FFF8F1',
                border: '1px solid #FFD2A8',
                flexShrink: 0,
                transform: 'translateY(-3px)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {/* Old EggPuff Fire */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  display: 'block',
                }}
              >
                {/* Sparkles */}
                <circle
                  cx="9"
                  cy="14"
                  r="2.5"
                  fill="#FFD54A"
                />

                <circle
                  cx="55"
                  cy="15"
                  r="2.5"
                  fill="#FFD54A"
                />

                <circle
                  cx="12"
                  cy="50"
                  r="2.2"
                  fill="#FFD54A"
                />

                <circle
                  cx="52"
                  cy="48"
                  r="2.2"
                  fill="#FFD54A"
                />

                {/* Flame */}
                <path
                  d="
                    M32 4
                    C42 12 49 22 49 33
                    C49 47 41 58 32 58
                    C21 58 13 48 13 35
                    C13 25 19 18 25 12
                    C25 22 32 24 32 4Z
                  "
                  fill="#FF7A1A"
                />

                {/* Inner Flame */}
                <path
                  d="
                    M32 16
                    C38 22 42 28 42 35
                    C42 43 37 50 32 50
                    C26 50 22 44 22 37
                    C22 31 25 27 29 23
                    C29 29 32 31 32 16Z
                  "
                  fill="#FFC547"
                />
              </svg>

              {/* Streak Number */}
              <span
                style={{
                  color: '#F97316',
                  fontWeight: 800,
                  lineHeight: 1,
                  fontSize:
                    (q.streak_count ?? 0) >= 100
                      ? 11
                      : (q.streak_count ?? 0) >= 10
                      ? 12
                      : 14,
                  letterSpacing:
                    (q.streak_count ?? 0) >= 100
                      ? '-0.4px'
                      : '-0.2px',
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'inline-block',
                }}
              >
                {q.streak_count ?? 0}
              </span>
            </span>
          )}
      </div>

      {/* RIGHT SIDE: TRENDING + MORE */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* TRENDING */}
        {q.is_trending && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              background:
                'linear-gradient(135deg, #FFF4E5, #FFE7CC)',
              color: '#D97706',
              border: '1px solid #FCD9A8',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            🔥 Trending
          </span>
        )}

        {/* MORE MENU */}
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          style={{
            position: 'relative',
          }}
        >
          <button
            data-question-menu-button
            ref={menuButtonRef}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              const next = !showMenu

              if (next) {
                window.dispatchEvent(
                  new CustomEvent(
                    'ep-question-menu-open',
                    {
                      detail: q.id,
                    }
                  )
                )
              }

              setShowMenu(next)
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {/* DROPDOWN */}
          {showMenu && (
            <div
              data-question-dropdown
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 34,
                right: 0,
                zIndex: 999999,
                minWidth: 240,
              }}
            >
              <QuestionActionsMenu
                onClose={() => {
                  setShowMenu(false)
                }}
                isOwner={
                  q.user_id === currentUserId
                }
                questionId={q.id}
                onDelete={() => {
                  onDelete?.(q.id)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>

    {/* USERNAME + TIME */}
    <div
      style={{
        fontSize: 12.5,
        opacity: 1,
        letterSpacing: '-0.1px',
        color: '#71767B',
        marginTop: -2,
        lineHeight: 1.2,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      @{q.username || 'user'} •{' '}
      {formatTime(q.created_at)}
    </div>
  </div>
</div>

{/* QUESTION CONTENT */}
<div
  onClick={(e) => {
    e.stopPropagation()
    goToQuestion()
  }}
  style={{
    cursor: 'pointer',
    marginLeft: 48,
    width: 'calc(100% - 48px)',
  }}
>
  <div
    ref={textRef}
    style={{
      marginTop: 12,

      marginBottom:
        q.link_url ? 8 : 10,

      fontSize: '16px',

      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',

      letterSpacing: '-0.12px',

      lineHeight: 1.55,

      fontWeight: 400,

      color: '#0F1419',

      whiteSpace: 'pre-wrap',

      wordBreak: 'break-word',

      overflowWrap: 'anywhere',
    }}
  >
    {(() => {
      /*
       * Prefer Lexical rich content when available.
       *
       * Old questions have no text_rich, so they
       * automatically use the existing plain-text
       * renderer below.
       */
      const richContent =
        parseRichContent(
          q.text_rich
        )

      const textToRender =
        isTextExpanded ||
        !isTextLong
          ? displayText
          : collapsedText

      /*
       * ------------------------------------------------
       * RICH TEXT
       * ------------------------------------------------
       */
      if (
        richContent?.children ||
        richContent?.type === 'root'
      ) {
        const richToRender =
          isTextExpanded ||
          !isTextLong
            ? richContent
            : truncateRichContent(
                richContent,
                collapsedText.length
              )

        const handleRichLinkClick =
          (href: string) => {
            const normalizedHref =
              href.startsWith('http')
                ? href
                : `https://${href}`

            let domain =
              'Website'

            try {
              domain =
                new URL(
                  normalizedHref
                )
                  .hostname
                  .replace(
                    /^www\./,
                    ''
                  )
            } catch {}

            sessionStorage.setItem(
              'ep_inapp_browser',
              normalizedHref
            )

            router.push(
              `/browser?url=${encodeURIComponent(
                normalizedHref
              )}&domain=${encodeURIComponent(
                domain
              )}`
            )
          }

        const rootChildren =
          Array.isArray(
            richToRender.children
          )
            ? richToRender.children
            : []

        return (
          <>
            {rootChildren.map(
              (node, index) => (
                <span
                  key={`paragraph-${index}`}
                >
                  {renderRichNodes(
                    [node],
                    handleRichLinkClick,
                    `rich-${index}`
                  )}

                  {node.type ===
                    'paragraph' &&
                    index <
                      rootChildren.length -
                        1 && (
                      <br />
                    )}
                </span>
              )
            )}

            {isTextLong &&
              !isTextExpanded && (
                <>
                  {'... '}

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      setIsTextExpanded(
                        true
                      )
                    }}
                    style={{
                      display:
                        'inline',

                      margin: 0,

                      padding: 0,

                      border: 'none',

                      background:
                        'transparent',

                      color:
                        '#1D9BF0',

                      fontSize:
                        'inherit',

                      fontWeight:
                        600,

                      lineHeight:
                        'inherit',

                      fontFamily:
                        'inherit',

                      letterSpacing:
                        'inherit',

                      cursor:
                        'pointer',

                      verticalAlign:
                        'baseline',

                      WebkitTapHighlightColor:
                        'transparent',
                    }}
                  >
                    Read more
                  </button>
                </>
              )}
          </>
        )
      }

      /*
       * ------------------------------------------------
       * EXISTING PLAIN-TEXT FALLBACK
       * ------------------------------------------------
       *
       * This is intentionally kept for:
       * - old questions
       * - questions without text_rich
       * - backwards compatibility
       */
      const cleanText =
        textToRender.replace(
          /\bhttps?:\/\/https?:\/\//gi,
          'https://'
        )

      return (
        <>
          {cleanText
            .split(
              /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/
            )
            .map(
              (
                part,
                index
              ) => {
                const isLink =
                  /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(
                    part
                  )

                if (isLink) {
                  const href =
                    part.startsWith(
                      'http'
                    )
                      ? part
                      : `https://${part}`

                  const domain =
                    (() => {
                      try {
                        return new URL(
                          href
                        )
                          .hostname
                          .replace(
                            /^www\./,
                            ''
                          )
                      } catch {
                        return 'Website'
                      }
                    })()

                  /*
                   * Keep the existing URL display
                   * behavior unchanged.
                   */
                  const displayLinkText =
                    part
                      .replace(
                        /^https?:\/\//i,
                        ''
                      )
                      .replace(
                        /^www\./i,
                        ''
                      )
                      .replace(
                        /\/$/,
                        ''
                      )

                  return (
                    <span
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()

                        sessionStorage.setItem(
                          'ep_inapp_browser',
                          href
                        )

                        router.push(
                          `/browser?url=${encodeURIComponent(
                            href
                          )}&domain=${encodeURIComponent(
                            domain
                          )}`
                        )
                      }}
                      style={{
  display: 'inline-block',

  maxWidth: '100%',

  overflow: 'hidden',

  textOverflow: 'ellipsis',

  whiteSpace: 'nowrap',

  color:
    '#1D9BF0',

  cursor:
    'pointer',

  wordBreak:
    'normal',

  overflowWrap:
    'normal',

  textDecoration:
    'none',

  verticalAlign:
    'bottom',

  transition:
    'opacity 0.12s ease',
}}
                      onTouchStart={(
                        e
                      ) => {
                        e.currentTarget.style.opacity =
                          '0.7'
                      }}
                      onTouchEnd={(
                        e
                      ) => {
                        e.currentTarget.style.opacity =
                          '1'
                      }}
                    >
                      {
                        displayLinkText
                      }
                    </span>
                  )
                }

                return (
                  <span
                    key={index}
                  >
                    {part}
                  </span>
                )
              }
            )}

          {isTextLong &&
            !isTextExpanded && (
              <>
                {'... '}

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    setIsTextExpanded(
                      true
                    )
                  }}
                  style={{
                    display:
                      'inline',

                    margin: 0,

                    padding: 0,

                    border: 'none',

                    background:
                      'transparent',

                    color:
                      '#1D9BF0',

                    fontSize:
                      'inherit',

                    fontWeight:
                      600,

                    lineHeight:
                      'inherit',

                    fontFamily:
                      'inherit',

                    letterSpacing:
                      'inherit',

                    cursor:
                      'pointer',

                    verticalAlign:
                      'baseline',

                    WebkitTapHighlightColor:
                      'transparent',
                  }}
                >
                  Read more
                </button>
              </>
            )}
        </>
      )
    })()}
  </div>
</div>

{/* 🔥 RICH PREVIEW */}
{q.link_url && (
  <div
    onClick={(e) => {
      e.stopPropagation()
    }}
    style={{
      cursor: 'pointer',

      marginLeft: 48,
      width: 'calc(100% - 48px)',
    }}
  >
    <LinkPreviewCard
      url={q.link_url}
      title={q.link_title}
      description={q.link_description}
      image={q.link_image}
      domain={q.link_domain}
      type={q.link_type}
    />
  </div>
)}

    {/* ACTION ROW */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 6,

    marginLeft: 48,
    width: 'calc(100% - 48px)',

    color: '#6B7280',

    paddingLeft: 0,
    paddingRight: 0,
  }}
>
  {/* ANSWERS */}
  <div
    onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()

  setShowMenu(false)
  setShowShareMenu(false)

  goToQuestion()
}}
    style={actionStyle}
  >
    <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
</svg>

    <span>
      {q.answers_count
        ? `${q.answers_count}`
        : 'Answer'}
    </span>
  </div>

  {/* HELPFUL */}
<div
  onClick={(e) => {
    setShowMenu(false)
    setShowShareMenu(false)

    toggleHelpful(e)
  }}
  style={{
    ...actionStyle,
  }}
>
<span
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    width: 18,
    height: 18,

    transform:
      helpfulAnimating
        ? 'scale(1.22)'
        : 'scale(1)',

    transition:
      'transform 180ms cubic-bezier(.34,1.56,.64,1)',

    filter:
      helpfulAnimating && isHelpful
        ? 'drop-shadow(0 2px 5px rgba(255,45,122,0.25))'
        : 'none',
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={
      isHelpful
        ? '#FF2D7A'
        : 'none'
    }
    stroke={
      isHelpful
        ? '#FF2D7A'
        : 'currentColor'
    }
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
</span>

  <span
    style={{
      color: '#6B7280',
    }}
  >
    {helpfulCount > 0
      ? `${helpfulCount}`
      : 'Helpful'}
  </span>
</div>

  {/* SAVE */}
<div
  onClick={(e) => {
    setShowMenu(false)
    setShowShareMenu(false)

    toggleSave(e)
  }}
  style={{
    ...actionStyle,
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={
      saved
        ? 'currentColor'
        : 'none'
    }
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
  </svg>

  <span>Save</span>
</div>

  {/* SHARE */}
<div
  ref={shareButtonRef}
  onPointerDown={(e) => {
    e.stopPropagation()
  }}
  onClick={(e) => {
    e.stopPropagation()

    /*
     * More menu and Share menu should
     * never be visible together.
     */
    setShowMenu(false)

    const next = !showShareMenu

    if (next) {
      window.dispatchEvent(
        new CustomEvent('ep-share-open', {
          detail: q.id,
        })
      )
    }

    setShowShareMenu(next)
  }}
  style={{
  ...actionStyle,

  position: 'relative',

  /*
   * Keeps the Share menu above the other action
   * buttons inside this card.
   */
  zIndex: showShareMenu ? 1001 : 1,
}}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M12 16V3" />
    <path d="M7 8l5-5 5 5" />
  </svg>

  <span>Share</span>

{showShareMenu && (
  <div
    ref={shareMenuRef}
    onPointerDown={(e) => {
      e.stopPropagation()
    }}
    onClick={(e) => {
      e.stopPropagation()
    }}
    style={{
  position: 'absolute',

  /*
   * The menu opens upward or downward depending
   * on the available viewport space.
   */
  ...(shareMenuPlacement === 'up'
    ? {
        bottom: 'calc(100% + 8px)',
        top: 'auto',
      }
    : {
        top: 'calc(100% + 8px)',
        bottom: 'auto',
      }),

  right: 0,

  width: 275,

  maxWidth:
    'calc(100vw - 32px)',

  padding: '8px',

  background: '#FFFFFF',

  borderRadius: 20,

  border:
    '1px solid rgba(15, 20, 25, 0.06)',

  boxShadow:
    '0 12px 32px rgba(15, 20, 25, 0.14)',

  /*
   * The card itself is lifted when the menu is open.
   * This z-index keeps the menu above everything
   * inside that card.
   */
  zIndex: 1001,

  boxSizing: 'border-box',

  overflow: 'hidden',

  color: '#4B5563',

  WebkitTapHighlightColor:
    'transparent',
}}
  >
      {/* SHARE IMAGE */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          setShowShareMenu(false)

          setShareData({
  question: q.text,
  creator:
    q.user_name || 'Anonymous',
  username:
    q.username || 'user',
  helpfulCount,
  answersCount:
    q.answers_count ?? 0,
})

requestAnimationFrame(async () => {
  await handleImageShare()
})
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="4" y="5" width="16" height="14" rx="3" />
  <path d="M12 15V8" />
  <path d="M9 11l3-3 3 3" />
</svg>

<span>Share as image</span>
      </div>

      {/* COPY LINK */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          await navigator.clipboard.writeText(
            `${window.location.origin}/question/${q.id}`
          )

          setShowShareMenu(false)
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M10 13a4 4 0 0 1 0-6l2-2a4 4 0 1 1 6 6l-1 1" />
  <path d="M14 11a4 4 0 0 1 0 6l-2 2a4 4 0 1 1-6-6l1-1" />
</svg>

<span>Copy link</span>
      </div>

      {/* MORE OPTIONS */}
      <div
        onClick={async (e) => {
          e.stopPropagation()

          try {
            await navigator.share({
              title:
                'EggPuff',

              text:
                q.text,

              url:
                `${window.location.origin}/question/${q.id}`,
            })
          } catch {}

          setShowShareMenu(false)
        }}
        style={{
          padding:
            '14px 16px',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          gap: 12,

          fontSize: 15,

          fontWeight: 500,
        }}
      >
        <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="5" r="1.8" />
  <circle cx="12" cy="12" r="1.8" />
  <circle cx="12" cy="19" r="1.8" />
</svg>

<span>More options</span>
      </div>
    </div>
  )}
</div>
</div>

      {/* 🫧 BUBBLE LABEL */}
{q.type === 'bubble' && (
  <div
    style={{
      position: 'absolute',
      bottom: 12,
      right: 14,
      fontSize: 11,
      color: '#92400E',
      background: '#FEF3C7',
      padding: '4px 10px',
      borderRadius: 999,
      fontWeight: 600,
    }}
  >
    🫧 Expires in 24h
  </div>
)}

{q._missed && (
  <div style={{ marginTop: 8 }}>
    {feedback === null ? (
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={(e) => {
           e.stopPropagation()
           setFeedback('up')
           markHelpful(q)
          }}
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          👍 Helpful
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setFeedback('down')
            markNotUseful(q)
          }}
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          👎 Not useful
        </button>
      </div>
    ) : (
      <div
        style={{
          fontSize: 12,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        Thanks for your feedback 🙌
      </div>
    )}
  </div>
)}

<div
  style={{
    position: 'fixed',

    left: -99999,

    top: 0,

    pointerEvents:
      'none',
  }}
>
</div>

      {/* FLOAT */}
      <style jsx>{`
        @keyframes floatBubble {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  )
}