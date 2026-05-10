'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
  type: 'followers' | 'following' | 'friends'
  profileUserId: string
  currentUserId: string | null
}

export default function FollowListSheet({
  open,
  onClose,
  type,
  profileUserId,
  currentUserId,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return

    const load = async () => {
      setLoading(true)
      
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

// ================= LOAD PROFILES =================
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('user_id', ids)

setUsers(profiles || [])

if (ids.length === 0) {
  setUsers([])
  setLoading(false)
  return
}

const profilesPromise = supabase
  .from('profiles')
  .select('*')
  .in('user_id', ids)

// ================= CURRENT USER FOLLOWING =================
if (currentUserId) {
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  setFollowingIds(
    data?.map((d) => d.following_id) || []
  )
}

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
          fixed z-50 bg-white
          bottom-0 left-0 right-0
          rounded-t-3xl
          max-h-[80vh]
          overflow-y-auto
          p-4
          shadow-2xl

          lg:max-w-[420px]
          lg:left-1/2
          lg:bottom-auto
          lg:top-1/2
          lg:-translate-x-1/2
          lg:-translate-y-1/2
          lg:rounded-3xl
        "
      >
        {/* HANDLE */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 lg:hidden" />

        {/* TITLE */}
        <h2 className="text-lg font-semibold capitalize mb-4 text-center">
          {type}
        </h2>

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
        <div className="space-y-3">
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
                    router.push(`/u/${u.username}`)
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={u.avatar_url || '/default-avatar.png'}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div>
                    <div className="font-medium text-sm">
                      {u.name}
                    </div>

                    <div className="text-xs text-gray-500">
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
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
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