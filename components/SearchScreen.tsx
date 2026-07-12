'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNavigation } from '@/components/navigation/useNavigation'

export default function SearchPage() {
  const router = useRouter()

  const {
  openProfile,
  openQuestion,
} = useNavigation()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const [users, setUsers] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'questions'>('all')
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])

  const limit = expanded ? 15 : 5

useEffect(() => {
  if (!query.trim()) {
    setUsers([])
    setQuestions([])
    setLoading(false)
    return
  }

  const delayDebounce = setTimeout(() => {
    search(query)
  }, 300)

  return () => clearTimeout(delayDebounce)
}, [query])

const search = async (q: string) => {
  const currentQuery = q.trim() // ✅ moved inside

  try {
    setLoading(true)

    // 👤 USERS
    const { data: usersData } = await supabase
      .from('profiles')
      .select('user_id, username, name, avatar_url')
      .ilike('username', `%${currentQuery}%`)
      .limit(limit)

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    // ❓ QUESTIONS
    const { data: questionsData } = await supabase
      .from('questions')
      .select('id, text, created_at, user_id')
      .ilike('text', `%${currentQuery}%`)
      .gte('created_at', oneMonthAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    // 🔥 FETCH PROFILES
    const userIds = questionsData?.map(q => q.user_id) || []

    let profileMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, name, avatar_url')
        .in('user_id', userIds)

      profiles?.forEach((p) => {
        profileMap[p.user_id] = p
      })
    }

    const finalQuestions =
      questionsData?.map((q) => ({
        ...q,
        profile: profileMap[q.user_id] || null,
      })) || []

    // 🔥 STALE CHECK (RIGHT PLACE)
    if (currentQuery !== query.trim()) return

    // ✅ SET STATE
    setUsers(usersData || [])
    setQuestions(finalQuestions)

  } catch (err) {
    console.error('Search error:', err)
  } finally {
    setLoading(false)
  }
}

const highlightText = (text: string, query: string) => {
  if (!query) return text

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // ✅ fix regex bug

  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'))

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="bg-yellow-200 text-black rounded px-[2px]">
        {part}
      </span>
    ) : (
      part
    )
  )
}

const formatTime = (dateString: string) => {
  const now = new Date()
  const past = new Date(dateString)
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

useEffect(() => {
  const fetchSuggested = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, username, name, avatar_url')
      .order('created_at', { ascending: false }) // recent users
      .limit(5)

    setSuggestedUsers(data || [])
  }

  fetchSuggested()
}, [])

 return (
   <div className="fixed inset-0 bg-[#f5f5f5] z-40 overflow-y-auto overflow-x-hidden">

  {/* 🔍 SEARCH BAR */}
  <div className="px-4 py-2 bg-white sticky top-0 z-50 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-2">

      {/* 🔙 BACK BUTTON (only when expanded) */}
      {expanded && (
        <button
          onClick={() => {
            setExpanded(false)
            setActiveTab('all')
          }}
          className="p-1 active:scale-90 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18l-6-6 6-6"
            />
          </svg>
        </button>
      )}

      {/* 🔍 INPUT */}
<div className="relative flex-1">
  <input
    type="search"
    name="global-search"
    autoFocus
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search people or questions..."
    autoComplete="off"
    autoCorrect="off"
    autoCapitalize="none"
    spellCheck={false}
    enterKeyHint="search"
    className="w-full bg-gray-100 px-4 py-2 pr-10 rounded-full text-sm outline-none"
  />
</div>

    </div>
  </div>

  {/* 🔥 CONTENT (IMPORTANT: moved outside input wrapper) */}
  <div className="mt-3">

    {/* ✅ SUGGESTED USERS */}
    {!query && !loading && (
  <div className="mt-6">

    {/* 🔥 SECTION HEADER */}
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="text-sm font-medium text-gray-700">
        Suggested for you
      </div>
    </div>

    {/* 🔥 CARDS */}
    <div className="overflow-x-auto px-4 pb-2 no-scrollbar">
      <div className="flex gap-3 w-max">

        {suggestedUsers.map((u) => (
          <div
            key={u.user_id}
  onClick={() => {
  openProfile(u.username)
}}
            className="w-[140px] flex-shrink-0 bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center cursor-pointer transition hover:shadow-md"
          >
            <img
              src={u.avatar_url || '/default-avatar.png'}
              className="w-16 h-16 rounded-full object-cover mb-3"
            />

            <div className="text-sm font-semibold text-center truncate w-full">
              {u.name || 'User'}
            </div>

            <div className="text-xs text-gray-400 text-center truncate w-full">
              @{u.username}
            </div>
          </div>
        ))}

      </div>
    </div>

  </div>
)}

  </div>

    {/* 🧠 TABS */}
    {expanded && (
      <div className="flex gap-6 px-4 pt-3 bg-white sticky top-[52px] z-40 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        {['all', 'people', 'questions'].map((tab) => (
          <button
  key={tab}
  onClick={() => setActiveTab(tab as any)}
  className={`relative text-sm pb-2 capitalize transition ${
    activeTab === tab
      ? 'text-[var(--brand)] font-medium'
      : 'text-gray-400'
  }`}
>
  {tab}

  {/* 🔥 UNDERLINE */}
  <span
    className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] rounded-full bg-[var(--brand)] transition-all duration-300 ${
      activeTab === tab ? 'w-6 opacity-100' : 'w-0 opacity-0'
    }`}
  />
</button>
        ))}
      </div>
    )}

    {/* CONTENT */}
    <div className="pb-[80px]">

      {/* 🧠 EMPTY STATE */}
      {!query && !loading && (
        <div className="text-center mt-20 text-gray-400 text-sm">
          Looking for someone? 👀
        </div>
      )}

      {/* ⏳ LOADING */}
      {loading && (
        <div className="px-4 mt-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && (
  (activeTab === 'all' && users.length === 0 && questions.length === 0) ||
  (activeTab === 'people' && users.length === 0) ||
  (activeTab === 'questions' && questions.length === 0)
) && (
  <div className="flex flex-col items-center justify-center mt-20 text-center px-6">

    <div className="text-3xl mb-3">🔍</div>

    <div className="text-sm font-medium text-gray-700">
      {activeTab === 'people'
        ? 'No users found'
        : activeTab === 'questions'
        ? 'No questions found'
        : 'No results found'}
    </div>

    <div className="text-xs text-gray-400 mt-1">
      Try a different keyword
    </div>

  </div>
)}

      {/* 📊 RESULTS */}
{!loading && (
  <div className="flex flex-col mt-0">

    {/* 👤 PEOPLE */}
    {(activeTab === 'all' || activeTab === 'people') && users.length > 0 && (
      <div className="mt-0">
        <div className="px-4 text-xs text-gray-400 mb-1">People</div>

        {users.map((u) => (
          <div
            key={u.user_id}
            onClick={() => {
  openProfile(u.username)
}}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
          >
            <img
              src={u.avatar_url || '/default-avatar.png'}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium">
                {u.name || 'User'}
              </div>
              <div className="text-xs text-gray-400">
                @{u.username}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ❓ QUESTIONS */}
    {(activeTab === 'all' || activeTab === 'questions') && questions.length > 0 && (
      <div
        className={`mt-3 ${
          activeTab !== 'questions'
            ? 'shadow-[0_-1px_0_rgba(0,0,0,0.05)]'
            : ''
        }`}
      >
        <div className="px-4 pt-3 text-xs text-gray-400 mb-1">Questions</div>

        {questions.map((q) => (
          <div
            key={q.id}
            onClick={() => {
  openQuestion(q.id)
}}
            className="mx-4 my-2 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition"
          >
            {/* 👤 USER HEADER */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={
                  q.profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${q.user_id}`
                }
                className="w-8 h-8 rounded-full object-cover"
              />

              <div className="flex flex-col leading-tight">
                <div className="text-sm font-medium">
                  {q.profile?.name || `user_${q.user_id.slice(0, 4)}`}
                </div>

                <div className="text-xs text-gray-400">
                  @{q.profile?.username || q.user_id.slice(0, 5)} • {formatTime(q.created_at)}
                </div>
              </div>
            </div>

            {/* ❓ QUESTION TEXT */}
            <div className="text-sm text-black leading-relaxed">
              {highlightText(q.text, query)}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* 🔥 SHOW MORE */}
    {!expanded && (users.length >= 5 || questions.length >= 5) && (
      <div className="px-4 py-3">
        <button
          onClick={() => {
            setExpanded(true)
            setActiveTab('all')
          }}
          className="text-sm text-[var(--brand)] font-medium"
        >
          See all results →
        </button>
      </div>
    )}

   </div>
  )}
 </div>
 </div>

)}