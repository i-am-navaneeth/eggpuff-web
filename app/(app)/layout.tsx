'use client'

import TopBar from '@/components/TopBar'
import Sidebar from '@/components/sidebar'
import MobileNavbar from '@/components/mobile-navbar'
import FloatingAskButton from '@/components/FloatingAskButton'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'


export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {

  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()
  const isSearch = pathname.startsWith('/search')
  const onRefreshFeed = () => {
  window.dispatchEvent(
    new CustomEvent('ep-refresh-feed')
  )
}

  useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getSession()
    const user = data?.session?.user
    if (user) setUserId(user.id)
  }

  loadUser()
}, [])

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">

      {/* ===================== SIDEBAR (DESKTOP ONLY) ===================== 
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
*/}
      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 flex flex-col">

        {/* ===================== TOP BAR ===================== */}
      {!pathname.startsWith('/search') && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f5] shadow-sm lg:pl-[80px]">
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
    pathname.startsWith('/search') ? 'pt-0 mt-0' : 'pt-[55px]'
  } px-0 sm:px-6 max-w-[1140px] mx-auto w-full lg:pl-[80px]`}
>
          <main className="flex-1 py-4">
            {children}
            {modal}
          </main>
          
            <MobileNavbar userId={userId || undefined} />
            <FloatingAskButton />
            
          
        </div>

      </div>
    </div>
  )
}