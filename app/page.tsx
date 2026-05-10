'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  const [epCount, setEpCount] = useState(0)
  const [joinedToday, setJoinedToday] = useState(120)
  const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

  // ⚡ EP counter animation
  useEffect(() => {
    let start = 0
    const end = 1240
    const duration = 1200

    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setEpCount(end)
        clearInterval(timer)
      } else {
        setEpCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [])

  // 🎯 Dynamic "students joined today"
  useEffect(() => {
    const interval = setInterval(() => {
      setJoinedToday((prev) => prev + Math.floor(Math.random() * 2))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* 🌈 BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/20 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-yellow-400/10 blur-[180px] rounded-full" />
      </div>

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-6 py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">EggPuff</h1>

        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Join your campus
        </button>
      </div>

      {/* ================= HERO ================= */}
      <section className="text-center px-6 mt-16 mb-20 relative">

        {/* 🎯 Dynamic badge 
        <div className="mb-6 inline-block bg-white/10 px-4 py-1 rounded-full text-sm border border-white/20">
          🎯 {joinedToday} students joined today
        </div>*/}

        <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
          Your Campus,
          <br />
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            One Place
          </span>
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Ask questions, connect with students, and grow together — all within your own college.
        </p>

        {/* FLOATING CARDS */}
        <div className="hidden md:block">
          <div className="absolute left-10 top-10 bg-white/10 p-4 rounded-xl text-sm">
            💬 “Anyone here building a startup?”
            <div className="text-xs text-gray-400 mt-1">2 answers • just now</div>
          </div>

          <div className="absolute right-10 top-24 bg-white/10 p-4 rounded-xl text-sm">
            💬 “Looking for hackathon teammates”
            <div className="text-xs text-gray-400 mt-1">5 responses</div>
          </div>

          <div className="absolute left-20 bottom-0 bg-white/10 p-4 rounded-xl text-sm">
            💬 “Best way to prepare for placements?”
            <div className="text-xs text-gray-400 mt-1">8 answers • active</div>
          </div>
        </div>

      </section>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* ================= RELATABLE PAIN ================= */}
      <section className="text-center max-w-3xl mx-auto mb-20 px-6">
        <h3 className="text-3xl font-semibold mb-6">
          Ever felt stuck in your college?
        </h3>

        <p className="text-gray-400">
          Finding notes before exams, getting real answers, meeting the right people,
          or even knowing what’s happening around you — it’s harder than it should be.
        </p>
      </section>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* ================= WHAT IS EGGPUFF ================= */}
     <section className="text-center max-w-3xl mx-auto mb-20 px-6">
  <h3 className="text-3xl font-semibold mb-6">Meet EggPuff</h3>

  <p className="text-gray-400 mb-4">
    A campus-based platform where students ask, answer, and connect —
    all within their own college.
  </p>

  {/* 🔥 NEW LINK */}
  <button
    onClick={() => router.push('/what-is-eggpuff')}
    className="text-sm text-white hover:underline"
  >
    Learn what EggPuff is →
  </button>
</section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-5xl mx-auto px-6 mb-20 grid md:grid-cols-3 gap-6">
        {[
          "Ask questions to your campus",
          "Get answers from real students",
          "Make friends & connections",
          "Find like-minded people",
          "Discover opportunities",
          "Promote your work",
        ].map((item, i) => (
          <div key={i} className="bg-white/5 p-5 rounded-xl border border-white/10">
            {item}
          </div>
        ))}
      </section>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* ================= DIFFERENTIATION ================= */}
      <section className="text-center max-w-3xl mx-auto mb-20 px-6">
        <h3 className="text-3xl font-semibold mb-6">
          Built for students. Not for strangers.
        </h3>

        <p className="text-gray-400">
          Everything happens within your college — making interactions real,
          relevant, and meaningful. It's just you, and your campus students.
        </p>
      </section>

      {/* ================= SOCIAL PROOF ================= */}
      <section className="text-center mb-20">
        <h3 className="text-4xl font-bold">{epCount}+</h3>
        <p className="text-gray-400">
          EggPuffs earned by students helping each other
        </p>
      </section>

      {/* ================= PREVIEW ================= */}
      <section className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <h3 className="mb-6">See what students are asking 👇</h3>

        <div className="bg-white/5 p-6 rounded-2xl space-y-4 text-left">
          <div className="bg-black/40 p-4 rounded-xl">
            “Ready for esports?”
            <div className="text-xs text-gray-400 mt-1">💬 3 responses</div>
          </div>

          <div className="bg-black/40 p-4 rounded-xl">
            “Best way to prepare for placements?”
            <div className="text-xs text-gray-400 mt-1">💬 8 responses</div>
          </div>

          <div className="bg-black/40 p-4 rounded-xl">
            “Selling ML notes PDF”
            <div className="text-xs text-gray-400 mt-1">💬 2 responses</div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* ================= FINAL CTA ================= */}
      <section className="text-center mb-16">
        <h3 className="text-3xl font-bold mb-4">
          Enter your campus 🚀
        </h3>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Join your campus
        </button>

          <button
            onClick={() => router.push('/login')}
            className="border border-white/20 px-8 py-3"
          >
            Explore
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-3">
          Be among the early students in your college
        </p>
      </section>

      {/* ================= TRUST ================= */}
      <section className="text-center mb-20 px-6">
        <p className="text-gray-400">
          Secure login with Google. No passwords. No spam.
        </p>
      </section>

      {/* DIVIDER */}
      <div className="w-full h-px bg-white/10 mb-6"></div>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-sm pb-10">

  {/* SOCIAL LINKS */}
  <div className="flex justify-center gap-6 mb-4">

  {/* INSTAGRAM */}
  <a
    href="https://www.instagram.com/eggpuff.in"
    target="_blank"
    className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5"/>
      <circle cx="17" cy="7" r="1" fill="white"/>
    </svg>
    Instagram
  </a>

</div>

  © {new Date().getFullYear()} EggPuff. All rights reserved.
</footer>

    </main>
  )
}