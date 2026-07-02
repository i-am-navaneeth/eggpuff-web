'use client'

import TopBar from '@/components/TopBar'
import Sidebar from '@/components/sidebar'
import MobileNavbar from '@/components/mobile-navbar'
import FloatingAskButton from '@/components/FloatingAskButton'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'
import OverlayRoot from './OverlayRoot'
import { ShellLayoutProvider } from '@/components/ShellLayoutContext'
import FeedHost from '@/components/FeedHost'


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {

  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()

const showFeedHost =
  pathname !== '/notifications'

  const hideTopBar =
  pathname.startsWith('/search') ||
  pathname.startsWith('/ask')

const showTopBar = !hideTopBar

console.log({
  pathname,
  showTopBar,
})
  const isSearch = pathname.startsWith('/search')
  const onRefreshFeed = () => {
  window.dispatchEvent(
    new CustomEvent('ep-refresh-feed')
  )
}

  useEffect(() => {
  const loadUser = async () => {
  const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

  if (user) {
    setUserId(user.id)
  }
}

  loadUser()
}, [])


const TOP_BAR_HEIGHT = showTopBar ? 55 : 0
const BOTTOM_BAR_HEIGHT = 64


console.log({
  pathname,
});
  return (
    <ShellLayoutProvider topInset={TOP_BAR_HEIGHT} bottomInset={BOTTOM_BAR_HEIGHT} >

    
    <div className="min-h-screen bg-[#f5f5f5] flex">

      {/* ===================== SIDEBAR (DESKTOP ONLY) ===================== 
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
*/}
      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 flex flex-col">

        {/* ===================== TOP BAR ===================== */}
      {showTopBar && (
  <div className="fixed top-0 left-0 right-0 z-[2000] bg-[#f5f5f5] shadow-sm lg:pl-[80px]">
    <div className="max-w-[1140px] mx-auto px-6">
      <TopBar
        currentUserId={userId}
        onRefreshFeed={onRefreshFeed}
      />
    </div>
  </div>
)}
        {/* ===================== PAGE CONTENT ===================== */}
        <div
className={`${
  showTopBar
    ? 'pt-[55px]'
    : 'pt-0'
} px-0 sm:px-6 max-w-[1140px] mx-auto w-full lg:pl-[80px]`}
>
         {/* Persistent Feed */}
{showFeedHost && <FeedHost active={pathname === '/feed'} />}

{/* Route Content */}
<main className="flex-1">
  {children}
</main>

{/* Overlays */}
<OverlayRoot />

{/* Floating UI */}
<FloatingAskButton />

{/* Always on top */}
<MobileNavbar userId={userId || undefined} />
            
          
        </div>

      </div>
    </div>
    
  </ShellLayoutProvider>
  )
}