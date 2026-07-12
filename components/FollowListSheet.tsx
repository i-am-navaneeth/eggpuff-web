'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import useScrollVisibility from '@/hooks/useScrollVisibility'

type Props = {
  open: boolean
  onClose: () => void
  type: 'followers' | 'following' | 'friends'
  profileUserId: string
  currentUserId: string | null

  bottomOffset?: number
}

export default function FollowListSheet({
  open,
  onClose,
  type,
  profileUserId,
  currentUserId,
  bottomOffset = 64,
}: Props) {
  const router = useRouter()

  const { openProfile } = useNavigation()
  const showNavbar = useScrollVisibility()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
  if (!open) {
    setUsers([])
    setFollowingIds([])
    setLoading(true)
    return
  }

  const load = async () => {
  setLoading(true)

  // Clear previous sheet data immediately
  setUsers([])
  setFollowingIds([])
      
// ================= FOLLOWERS / FOLLOWING / FRIENDS =================

let ids: string[] = []

// ================= FOLLOWERS =================
if (type === 'followers') {
  const { data: follows } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profileUserId)

  ids = follows?.map((f) => f.follower_id) || []
}

// ================= FOLLOWING =================
if (type === 'following') {
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profileUserId)

  ids = follows?.map((f) => f.following_id) || []
}

// ================= FRIENDS =================
if (type === 'friends') {
  const { data: mine } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profileUserId)

  const { data: theirs } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profileUserId)

  const mineIds =
    mine?.map((m) => m.following_id) || []

  const theirIds =
    theirs?.map((t) => t.follower_id) || []

  ids = mineIds.filter((id) =>
    theirIds.includes(id)
  )
}

// ================= EMPTY =================
if (ids.length === 0) {
  setUsers([])
  setLoading(false)
  return
}

// ================= LOAD EVERYTHING TOGETHER =================

const profilesPromise = supabase
  .from('profiles')
  .select('*')
  .in('user_id', ids)

const followingPromise = currentUserId
  ? supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId)
  : Promise.resolve({ data: [] })

const [
  { data: profiles },
  { data: following },
] = await Promise.all([
  profilesPromise,
  followingPromise,
])

// Update state only once everything is ready
setUsers(profiles || [])

setFollowingIds(
  following?.map((d) => d.following_id) || []
)

setLoading(false)
}

load()
}, [open, type, profileUserId, currentUserId])
  const handleFollow = async (targetUserId: string) => {
    if (!currentUserId) return

    const isFollowing = followingIds.includes(targetUserId)

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)

      setFollowingIds((prev) =>
        prev.filter((id) => id !== targetUserId)
      )
    } else {
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

      setFollowingIds((prev) => [...prev, targetUserId])
    }
  }
  const startY = useRef<number | null>(null)

const handleTouchStart = (
  e: React.TouchEvent<HTMLDivElement>
) => {
  startY.current = e.touches[0].clientY
}

const handleTouchEnd = (
  e: React.TouchEvent<HTMLDivElement>
) => {
  if (startY.current === null) return

  const endY = e.changedTouches[0].clientY
  const delta = endY - startY.current

  // Dragged downward enough
  if (delta > 70) {
    onClose()
  }

  startY.current = null
}

  if (!open) return null


  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50"
      />

      {/* SHEET */}
     <div
  className="
    fixed z-[2100]
    left-0 right-0

    bg-white
    rounded-t-3xl

    h-[72vh]
    max-h-[720px]

    flex
    flex-col

    shadow-2xl

    overflow-hidden

    lg:max-w-[420px]
    lg:left-1/2
    lg:bottom-auto
    lg:top-1/2
    lg:-translate-x-1/2
    lg:-translate-y-1/2
    lg:rounded-3xl
  "
  style={{
    bottom: bottomOffset,
    transition: 'bottom .25s ease',
  }}
>
       {/* STICKY HEADER */}
<div
  className="
    flex-shrink-0

    pt-2
    pb-4

    bg-white

    border-b border-gray-100

    z-30
  "
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  {/* HANDLE */}
  <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5 lg:hidden" />

  {/* TITLE */}
  <h2 className="text-xl font-semibold capitalize text-center">
    {type}
  </h2>
</div>

{/* LOADING */}
{loading && (
  <p className="text-center text-sm text-gray-400 py-6">
    Loading...
  </p>
)}

{/* EMPTY */}
{!loading && users.length === 0 && (
  <p className="text-center text-sm text-gray-400 py-6">
    No users found
  </p>
)}

{/* USERS */}
<div
  className="
    flex-1

    overflow-y-auto
    overscroll-contain

    px-4
    pt-2
    pb-5

    space-y-2
  "
>
          {users.map((u) => {
            const isMe = currentUserId === u.user_id
            const isFollowing =
              followingIds.includes(u.user_id)

            return (
              <div
                key={u.user_id}
                className="flex items-center justify-between"
              >
                {/* LEFT */}
                <div
                 onClick={() => {
  onClose()

  requestAnimationFrame(() => {
  openProfile(u.username)
})
}}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={u.avatar_url || '/default-avatar.png'}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <div className="font-medium text-[13px] leading-tight">
                      {u.name}
                    </div>

                    <div className="text-[11px] text-gray-500 leading-tight">
                      @{u.username}
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                {!isMe && (
                  <button
                    onClick={() =>
                      handleFollow(u.user_id)
                    }
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition ${
                      isFollowing
                        ? 'bg-gray-200 text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    {isFollowing
                      ? 'Following'
                      : 'Follow'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}