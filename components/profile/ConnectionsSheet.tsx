'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tab = 'friends' | 'followers' | 'following'

type Props = {
  open: boolean
  onClose: () => void
  profileUserId: string
  currentUserId: string | null
}

type UserItem = {
  id: string
  user_id: string
  username: string
  name: string
  avatar_url: string
  is_verified: boolean
  following?: boolean
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const connectionsCache = new Map<
  string,
  {
    data: UserItem[]
    expires: number
  }
>()

const followCache = new Map<
  string,
  {
    ids: string[]
    expires: number
  }
>()

export default function ConnectionsSheet({
  open,
  onClose,
  profileUserId,
  currentUserId,
}: Props) {
  const [tab, setTab] = useState<Tab>('friends')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 50

const [offset, setOffset] = useState(0)
const [hasMore, setHasMore] = useState(true)
const [loadingMore, setLoadingMore] = useState(false)
const loadMoreRef = useRef<HTMLDivElement | null>(null)
const observerRef = useRef<IntersectionObserver | null>(null)
const loadingLock = useRef(false)
  const [translateY, setTranslateY] = useState(0)
  const [dragStart, setDragStart] = useState<number | null>(null)


  useEffect(() => {
  if (!open) return

  // Reset sheet position every time it opens
  setTranslateY(0)
  setDragStart(null)

  // Reset pagination
  setOffset(0)
  setHasMore(true)
  setLoadingMore(false)
  loadingLock.current = false

  loadUsers(true)
}, [open, tab])

  useEffect(() => {
  if (!open) return

  const el = loadMoreRef.current

  if (!el) return

  observerRef.current?.disconnect()

  observerRef.current = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]

      if (
        entry.isIntersecting &&
        hasMore &&
        !loading &&
        !loadingMore &&
        !loadingLock.current
      ) {
        loadingLock.current = true
        loadUsers(false)
      }
    },
    {
      root: null,
      rootMargin: '350px',
      threshold: 0,
    }
  )

  observerRef.current.observe(el)

  return () => observerRef.current?.disconnect()
}, [
  users.length,
  hasMore,
  loading,
  loadingMore,
  open,
])

async function loadUsers(reset = false) {
  const pageOffset = reset ? 0 : offset

const cacheKey =
  `${profileUserId}-${tab}-${pageOffset}`

  const cached = connectionsCache.get(cacheKey)

if (cached && cached.expires > Date.now()) {

  if (reset) {
    setUsers(cached.data)
  } else {
    setUsers(prev => [...prev, ...cached.data])
  }

  setOffset(pageOffset + cached.data.length)
  setHasMore(cached.data.length === PAGE_SIZE)

  setLoading(false)
  setLoadingMore(false)

  return
}

  if (reset) {
  setLoading(true)
  setUsers([])
}

if (!reset) {
  setLoadingMore(true)
}

  let myFollowingIds: string[] = []

if (currentUserId) {
  const cached = followCache.get(currentUserId)

  if (cached && cached.expires > Date.now()) {
    myFollowingIds = cached.ids
  } else {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId)

    myFollowingIds =
      data?.map(f => f.following_id) ?? []

    followCache.set(currentUserId, {
      ids: myFollowingIds,
      expires: Date.now() + CACHE_TTL,
    })
  }
}

  try {
    // ================= FOLLOWERS =================
    if (tab === 'followers') {
      const pageOffset = reset ? 0 : offset

const { data: follows } = await supabase
  .from('follows')
  .select('follower_id')
  .eq('following_id', profileUserId)
  .range(
    pageOffset,
    pageOffset + PAGE_SIZE - 1
  )

const ids = follows?.map(f => f.follower_id) ?? []

if (ids.length === 0) {
  setHasMore(false)
  return
}

const { data: profiles } = await supabase
  .from('profiles')
  .select(`
    id,
    user_id,
    username,
    name,
    avatar_url,
    is_verified
  `)
  .in('user_id', ids)

     const result =
  (profiles || []).map(user => ({
    ...user,
    following: myFollowingIds.includes(user.user_id),
  }))

connectionsCache.set(cacheKey, {
  data: result,
  expires: Date.now() + CACHE_TTL,
})

setUsers(prev => {

  if (reset) return result

  const map = new Map()

  prev.forEach(u => map.set(u.user_id, u))
  result.forEach(u => map.set(u.user_id, u))

  return [...map.values()]
})

setOffset(prev => prev + result.length)

setHasMore(result.length === PAGE_SIZE)
      return
    }

    // ================= FOLLOWING =================
    if (tab === 'following') {
      const pageOffset = reset ? 0 : offset

const { data: follows } = await supabase
  .from('follows')
  .select('following_id')
  .eq('follower_id', profileUserId)
  .range(
    pageOffset,
    pageOffset + PAGE_SIZE - 1
  )

const ids = follows?.map(f => f.following_id) ?? []

if (ids.length === 0) {
  setHasMore(false)
  return
}

const { data: profiles } = await supabase
  .from('profiles')
  .select(`
    id,
    user_id,
    username,
    name,
    avatar_url,
    is_verified
  `)
  .in('user_id', ids)

     const result =
  (profiles || []).map(user => ({
    ...user,
    following: myFollowingIds.includes(user.user_id),
  }))

connectionsCache.set(cacheKey, {
  data: result,
  expires: Date.now() + CACHE_TTL,
})

setUsers(prev => {

  if (reset) return result

  const map = new Map()

  prev.forEach(u => map.set(u.user_id, u))
  result.forEach(u => map.set(u.user_id, u))

  return [...map.values()]
})

setOffset(prev => prev + result.length)

setHasMore(result.length === PAGE_SIZE)
      return
    }

    // ================= FRIENDS =================
    if (tab === 'friends') {
      const { data: following } = await supabase
  .from('follows')
  .select('following_id')
  .eq('follower_id', profileUserId)

const { data: followers } = await supabase
  .from('follows')
  .select('follower_id')
  .eq('following_id', profileUserId)

      const followingIds =
        following?.map(f => f.following_id) ?? []

      const followerIds =
        followers?.map(f => f.follower_id) ?? []

      const mutualIds = followingIds.filter(id =>
        followerIds.includes(id)
      )

      if (mutualIds.length === 0) {
        connectionsCache.set(cacheKey, {
  data: [],
  expires: Date.now() + CACHE_TTL,
})

setUsers([])
return
      }

      const pageOffset = reset ? 0 : offset

const pageIds = mutualIds.slice(
  pageOffset,
  pageOffset + PAGE_SIZE
)

if (pageIds.length === 0) {
  setHasMore(false)
  return
}

const { data: profiles } = await supabase
  .from('profiles')
  .select(`
    id,
    user_id,
    username,
    name,
    avatar_url,
    is_verified
  `)
  .in('user_id', pageIds)

     const result =
  (profiles || []).map(user => ({
    ...user,
    following: myFollowingIds.includes(user.user_id),
  }))

connectionsCache.set(cacheKey, {
  data: result,
  expires: Date.now() + CACHE_TTL,
})

setUsers(prev => {

  if (reset) return result

  const map = new Map()

  prev.forEach(u => map.set(u.user_id, u))
  result.forEach(u => map.set(u.user_id, u))

  return [...map.values()]
})

setOffset(prev => prev + result.length)

setHasMore(result.length === PAGE_SIZE)
      return
    }
  } finally {
    setLoading(false)
setLoadingMore(false)
loadingLock.current = false
  }
}

  if (!open) return null

return (
  <div
  className="fixed inset-0 z-[999] bg-black/25 backdrop-blur-[1px] touch-none"
  style={{
    overscrollBehavior: 'none',
    WebkitOverflowScrolling: 'auto',
  }}
  onClick={onClose}
>

    <div
  onClick={(e) => e.stopPropagation()}
  className="absolute left-0 right-0 bottom-0 bg-[#F9FAFB] rounded-t-3xl overflow-hidden shadow-2xl transition-transform duration-200 touch-pan-y"
  style={{
    top: 72,
    transform: `translateY(${translateY}px)`,
  }}
>

      <div
  className="flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none"
  onTouchStart={(e) => {
    e.stopPropagation()
    setDragStart(e.touches[0].clientY)
  }}
  onTouchMove={(e) => {
    e.stopPropagation()

    if (dragStart === null) return

    const diff = e.touches[0].clientY - dragStart

    if (diff <= 0) return

    e.preventDefault()

    if (e.cancelable) {
      e.nativeEvent.stopImmediatePropagation?.()
    }

    setTranslateY(diff)
  }}
  onTouchEnd={(e) => {
    e.stopPropagation()

    if (translateY > 120) {
      setTranslateY(0)
      setDragStart(null)
      onClose()
      return
    }

    setTranslateY(0)
    setDragStart(null)
  }}
>
  <div className="w-10 h-1.5 rounded-full bg-gray-300" />
</div>

    {/* Header */}
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 pt-safe">

      <div className="h-12 flex items-center px-5 relative">

  <h1 className="w-full text-center text-[16px] font-semibold">
    Connections
  </h1>

</div>

      {/* Tabs */}

      <div className="flex px-4 pb-2 gap-2">

  {(['friends','followers','following'] as Tab[]).map((t) => (

    <button
      key={t}
      onClick={() => setTab(t)}
      className={`flex-1 h-9 rounded-lg text-[13px] font-medium transition ${
        tab === t
          ? 'bg-black text-white'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {t.charAt(0).toUpperCase() + t.slice(1)}
    </button>

  ))}

</div>

    </div>

    {/* Users */}

    <div
  className="overflow-y-auto px-4 py-4 pb-28"
  style={{
    height: 'calc(100vh - 72px - 110px)',
    overscrollBehavior: 'contain',
  }}
>

      {loading && (
        <div className="text-center py-12 text-gray-400">
          Loading...
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No {tab} yet.
        </div>
      )}

      <div>

  {users.map((user, index) => (
    <div
      key={user.user_id}
      className={`${
        index !== users.length - 1
          ? 'border-b border-gray-100'
          : ''
      }`}
    >
      <UserRow
        user={user}
        currentUserId={currentUserId}
      />
    </div>
  ))}

<div ref={loadMoreRef} />

{loadingMore && (
  <div className="py-5 text-center text-gray-400 text-sm">
    Loading...
  </div>
)}
</div>

    </div>

      </div>

  </div>

)}


function UserRow({
  user,
  currentUserId,
}: {
  user: UserItem
  currentUserId: string | null
}) {
const [following, setFollowing] = useState(
  user.following ?? false
)
const router = useRouter()

  async function toggle() {
    if (!currentUserId) return

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', user.user_id)

      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: user.user_id,
        })

      setFollowing(true)
    }
  }

  return (
  <div className="flex items-center px-4 py-2.5">

    <div
      onClick={() => router.push(`/u/${user.username}`)}
      className="flex flex-1 items-center min-w-0 cursor-pointer"
    >

      <img
        src={user.avatar_url || '/default-avatar.png'}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="ml-3 min-w-0">

        <div className="flex items-center gap-1">

          <p className="font-semibold text-[14px] leading-5 truncate">
            {user.name}
          </p>

          {user.is_verified && (
            <span className="text-sky-500 text-xs">
              ✔︎
            </span>
          )}

        </div>

        <p className="text-[13px] text-gray-500 leading-4 truncate">
          @{user.username}
        </p>

      </div>

    </div>

    {currentUserId !== user.user_id && (

      <button
        onClick={toggle}
        className="ml-3 h-8 min-w-[84px] rounded-full border border-gray-300 text-[13px] font-medium transition active:scale-95"
      >
        {following ? 'Following' : 'Follow'}
      </button>

    )}

  </div>
)}