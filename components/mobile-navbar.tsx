'use client'

import { usePathname, useRouter } from 'next/navigation'
import useScrollVisibility from '@/hooks/useScrollVisibility'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigation } from '@/components/navigation/NavigationProvider'

export default function MobileNavbar({ userId }: { userId?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const { openProfile } = useNavigation()
  const hideNavbarRoutes = ['/ask', '/notifications', '/profile' ]
  const shouldHideNavbar = hideNavbarRoutes.some(route =>
  pathname.startsWith(route)
 ) 
  const showUI = useScrollVisibility()
  const [avatar, setAvatar] = useState<string | null>(null)

  
  const [unreadCount, setUnreadCount] = useState(0)

  const isActive = (path: string) => pathname === path

  const [username, setUsername] = useState<string | null>(null)

useEffect(() => {
  if (!userId) return

  const fetchUnread = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }

  fetchUnread()
}, [userId])

const fetchUnread = async () => {
  if (!userId) return

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  setUnreadCount(count || 0)
}

useEffect(() => {
  if (!userId) return

  const channel = supabase
    .channel('navbar-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      fetchUnread
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      fetchUnread
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])

useEffect(() => {
  if (!userId) return

  const handler = () => {
    fetchUnread()
  }

  window.addEventListener('notifications-read', handler)

  return () => {
    window.removeEventListener('notifications-read', handler)
  }
}, [userId])


useEffect(() => {
  let isMounted = true

  const loadUser = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user

      if (isMounted && user) {
        
      }
    } catch (err) {
      console.error('Failed to get session:', err)
    }
  }

  loadUser()

  return () => {
    isMounted = false
  }
}, [])

useEffect(() => {

  const cached =
    localStorage.getItem(
      'ep_avatar'
    )

  // 🔥 instant cached avatar
  if (cached) {
    setAvatar(cached)
  }

  const loadAvatar =
    async () => {

      const {
        data: { user }
      } = await supabase
        .auth
        .getUser()

      if (!user)
        return

      // 🔥 ALWAYS use DB avatar
      // NEVER OAuth image
      const {
        data,
        error,
      } = await supabase

        .from('profiles')

        .select(
          'avatar_url'
        )

        .eq(
          'user_id',
          user.id
        )

        .maybeSingle()

      if (
        !error &&
        data?.avatar_url
      ) {

        setAvatar(
          data.avatar_url
        )

        localStorage.setItem(
          'ep_avatar',
          data.avatar_url
        )
      }
    }

  loadAvatar()

}, [])

  useEffect(() => {
  if (!userId) return

  const markRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Failed to mark notifications as read:', error.message)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  markRead()
}, [userId])

useEffect(() => {
  if (!userId) return

  const handler = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setUnreadCount(count || 0)
  }

  window.addEventListener('notifications-read', handler)

  return () => {
    window.removeEventListener('notifications-read', handler)
  }
}, [userId])

// 🔥 Hide on question pages
if (pathname.startsWith('/question/')) {
  return null
}

// 🔥 Hide on communities pages
if (pathname.startsWith('/communities/')) {
  return null
}

// 🔥 Hide on other users profile pages
if (
  pathname.startsWith('/u/') &&
  username &&
  pathname !== `/u/${username}` &&
  !pathname.startsWith(`/u/${username}/`)
) {
  return null
}

// 🔥 Existing hidden routes
if (shouldHideNavbar) return null

  return (
    <div
  className={`fixed bottom-0 left-0 right-0 z-[2000] md:hidden h-16 transition-transform duration-300 ${
  showUI ? 'translate-y-0' : 'translate-y-full'
}`}
>

      {/* NAVBAR BACKGROUND */}
      <div
  className="absolute inset-0 bg-white border-t border-black/10"
  style={{
    zIndex: 0,
  }}
/>

      {/* CONTENT */}
      <div
  className="relative h-full grid grid-cols-5 items-center px-1"
  style={{
    zIndex: 1,
  }}
>

        {/* HOME */}
        <NavItem
          icon={<HomeIcon />}
          label="Home"
          active={isActive('/feed')}
          onClick={() => router.push('/feed')}
        />

        {/* SEARCH */}
        <NavItem
  icon={<SearchIcon />}
  label="Search"
  active={pathname === '/search'}
  onClick={() => router.push('/search')}
/>

        {/* COMMUNITIES */}

<NavItem
  icon={<CommunityIcon />}
  label="Communities"
  active={pathname.startsWith('/communities')}
  onClick={() => router.push('/communities')}
/>

        {/* NOTIFICATIONS */}
        <NavItem
  icon={
    <div className="relative w-6 h-6 flex items-center justify-center">
      <BellIcon />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[4px] text-[10px] leading-none flex items-center justify-center bg-[var(--brand)] text-white rounded-full font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  }
  label="Notifications"
  active={isActive('/notifications')}
  onClick={() => router.push('/notifications')}
/>

        {/* PROFILE */}
        <NavItem
  icon={
    <div className="relative w-[20px] h-[20px]">
      {/* Avatar Image */}
      {avatar && (
        <img
          src={avatar}
          onError={(e) => {
  e.currentTarget.style.display = 'none'
}}
          className="w-[20px] h-[20px] rounded-full object-cover"
        />
      )}

      {/* Fallback Avatar */}
{!avatar && (
  <div className="w-[20px] h-[20px] rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
    {username ? username[0].toUpperCase() : 'U'}
  </div>
)}
    </div>
  }
  label="Profile"
  active={
  !!username &&
  (
    pathname === `/u/${username}` ||
    pathname.startsWith(`/u/${username}/`)
  )
}
  onClick={async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .single()

  if (!profile?.username) return

  setUsername(profile.username)

  openProfile(profile.username)
}}
/>

      </div>
    </div>
  )
}

/* ================= NAV ITEM ================= */

function NavItem({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
  onClick={onClick}
  title={label}
  aria-label={label}
  className="relative flex flex-col items-center justify-center w-full h-[50px]"
>
      {/* ICON */}
      <div className={active ? 'text-[var(--brand)]' : 'text-black/40'}>
        {icon}
      </div>

      {/* ACCESSIBILITY ONLY */}
<span className="sr-only">
  {label}
</span>

      {/* UNDERLINE */}
      <span
        className={`absolute bottom-[4px] h-[2px] rounded-full transition-all duration-300 ${
          active
            ? 'w-5 bg-[var(--brand)] opacity-100'
            : 'w-0 opacity-0'
        }`}
      />
    </button>
  )
}

/* ================= ICONS ================= */

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20L17 17" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* CENTER PERSON */}
      <circle
        cx="12"
        cy="9"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* LEFT PERSON */}
      <circle
        cx="5.5"
        cy="11"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />

      {/* RIGHT PERSON */}
      <circle
        cx="18.5"
        cy="11"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />

      {/* BODY */}
      <path
        d="M7.5 18C7.5 15.8 9.3 14 12 14C14.7 14 16.5 15.8 16.5 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* LEFT BODY */}
      <path
        d="M2.8 18C2.8 16.5 4 15.3 5.7 15.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* RIGHT BODY */}
      <path
        d="M21.2 18C21.2 16.5 20 15.3 18.3 15.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  className="w-5 h-5 text-gray-400"
>
  <path
    d="M18 16V11C18 7.7 15.8 5 12 5C8.2 5 6 7.7 6 11V16L4 18V19H20V18L18 16Z"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M10 21C10.5 21.6 11.2 22 12 22C12.8 22 13.5 21.6 14 21"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
  )
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}