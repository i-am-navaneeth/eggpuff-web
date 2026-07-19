'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from "next/navigation"
import FadeIn from '@/components/landing/FadeIn'

export default function Home() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const [epCount, setEpCount] = useState(0)
  const [joinedToday, setJoinedToday] = useState(120)
  const handleGoogleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error(error)
    }
  } catch (err) {
    console.error(err)
  }
}

  useEffect(() => {
  const src = searchParams.get("src")

  const existing = localStorage.getItem("ep_source")

  if (src && !existing) {
    localStorage.setItem("ep_source", src)
  }
}, [searchParams])

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

      {/* ================= NAVBAR ================= */}

<header className="
sticky
top-0
z-50
backdrop-blur-2xl
bg-neutral-950/70
border-b
bg-white/[0.04]
border-white/[0.08]
backdrop-blur-sm
supports-[backdrop-filter]:bg-neutral-900/55
">

<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

<h1
className="text-2xl font-bold tracking-tight cursor-pointer"
onClick={() => router.push('/')}
>
EggPuff
</h1>

<div className="hidden md:flex items-center gap-8 text-sm text-gray-400">

<button
onClick={() => router.push('/what-is-eggpuff')}
className="hover:text-white transition"
>
About
</button>

<button
onClick={() => router.push('/community-guidelines')}
className="hover:text-white transition"
>
Guidelines
</button>

<button
onClick={() => router.push('/support')}
className="hover:text-white transition"
>
Support
</button>

</div>

<button
onClick={() => router.push('/login')}
  className="rounded-xl px-6 py-3 font-semibold text-black
  bg-gradient-to-r from-yellow-400 to-orange-500
  hover:scale-105 active:scale-95 transition"
>
  Join Campus
</button>

</div>

</header>

{/* ================= HERO ================= */}
<FadeIn>
<section
className="
relative
overflow-hidden
max-w-7xl
mx-auto
px-6
pt-16
pb-24
sm:pt-20
sm:pb-28
"
>

{/* Glow */}

<div className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-orange-500/15 blur-[180px]" />

{/* Small badge */}

<div
className="
relative
z-10
mx-auto
w-fit
mb-8
rounded-full
border
border-orange-400/20
bg-orange-500/10
text-xs
sm:text-sm
px-4
sm:px-5
py-2
text-orange-200
"
>

Built exclusively for college students

</div>

{/* Heading */}

<h1
className="
relative
z-10
mx-auto
max-w-5xl
text-center
font-black
leading-none
tracking-tight
text-4xl
sm:text-5xl
md:text-7xl
"
>

Your Campus.

<br />

<span
className="
bg-gradient-to-r
from-yellow-300
via-orange-400
to-orange-500
bg-clip-text
text-transparent
"
>

One Place.

</span>

</h1>

{/* Subtitle */}

<p
className="
relative
z-10
mx-auto
mt-8
max-w-2xl
text-center
text-base
sm:text-lg
leading-7
sm:leading-8
text-gray-400
"
>

Ask questions.

Help classmates.

Meet students.

Discover opportunities.

Everything happens inside your own college.

</p>

{/* CTA */}

<div
className="
relative
z-10
mt-12
flex
justify-center
gap-4
flex-wrap
"
>

<button
onClick={() => router.push('/login')}
className="
rounded-xl
border
border-white/10
px-7
py-3.5
sm:px-8
sm:py-4
hover:bg-white/5
transition
"
>

See how it works

</button>

</div>

{/* Trust */}

<p
className="
relative
z-10
mt-6
text-center
text-sm
text-gray-500
"
>

Google Sign-In • No passwords • No spam

</p>

{/* Floating cards */}

<div className="hidden lg:block">

<div
className="
absolute
left-0
top-40
w-72
rounded-2xl
border
bg-white/[0.04]
border-white/[0.08]
backdrop-blur-sm
backdrop-blur
p-5
rotate-[-6deg]
shadow-2xl
"
>

<div className="text-lg font-semibold">

"Anyone joining Hackathon?"

</div>

<div className="mt-3 text-sm text-gray-400">

💬 6 replies • Active now

</div>

</div>

<div
className="
absolute
right-0
top-52
w-72
rounded-2xl
border
bg-white/[0.04]
border-white/[0.08]
backdrop-blur-sm
backdrop-blur
p-5
rotate-[5deg]
shadow-2xl
"
>

<div className="text-lg font-semibold">

"Best ML notes?"

</div>

<div className="mt-3 text-sm text-gray-400">

💬 14 replies

</div>

</div>

<div
className="
absolute
left-24
bottom-0
w-80
rounded-2xl
border
bg-white/[0.04]
border-white/[0.08]
backdrop-blur-sm
backdrop-blur
p-5
rotate-[-3deg]
shadow-2xl
"
>

<div className="text-lg font-semibold">

"Placement prep group?"

</div>

<div className="mt-3 text-sm text-gray-400">

💬 31 students joined

</div>

</div>

</div>

{/* Live numbers */}

<div
className="
relative
z-10
mt-24
grid
grid-cols-3
max-w-xl
mx-auto
text-center
"
>

<div>

<div className="text-3xl font-bold">

{epCount}+

</div>

<div className="mt-2 text-sm text-gray-500">

EggPuffs

</div>

</div>

<div>

<div className="text-3xl font-bold">

100%

</div>

<div className="mt-2 text-sm text-gray-500">

Campus Only

</div>

</div>

<div>

<div className="text-3xl font-bold">

24×7

</div>

<div className="mt-2 text-sm text-gray-500">

Student Help

</div>

</div>

</div>

</section>
</FadeIn>
      {/* DIVIDER */}
      <div className="mx-auto max-w-6xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ==========================================================
    THE PROBLEM
========================================================== */}
<FadeIn>
<section className="max-w-6xl mx-auto px-6 py-20 md:py-28">

<div className="text-center mb-20">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

THE CAMPUS PROBLEM

</p>

<h2
  className="
    text-3xl
    sm:text-4xl
    md:text-6xl
    font-bold
    leading-tight
    text-center
  "
>
  College has
  <br />
  opportunities.
  <br />
  Finding them
  <br />
  shouldn't be hard.
</h2>

<p className="mt-8 max-w-3xl mx-auto text-lg leading-8 text-gray-400">

Every semester thousands of questions,
events, notes, opportunities and friendships
exist around you.

Most students simply never discover them.

</p>

</div>

<div className="grid md:grid-cols-2 gap-7">

{/* Card */}

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<div className="text-5xl mb-5">
📚
</div>

<h3 className="text-2xl font-bold mb-4">

Need notes before tomorrow's exam?

</h3>

<p className="text-gray-400 leading-7">

Instead of asking ten WhatsApp groups,
ask your entire campus in seconds.

</p>

</div>

{/* Card */}

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<div className="text-5xl mb-5">
🤝
</div>

<h3 className="text-2xl font-bold mb-4">

Looking for teammates?

</h3>

<p className="text-gray-400 leading-7">

Hackathons.

Projects.

Startups.

Find students who are already interested.

</p>

</div>

{/* Card */}

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<div className="text-5xl mb-5">
🎯
</div>

<h3 className="text-2xl font-bold mb-4">

Missing opportunities?

</h3>

<p className="text-gray-400 leading-7">

Internships.

Events.

Clubs.

Competitions.

Discover what's actually happening around you.

</p>

</div>

{/* Card */}

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<div className="text-5xl mb-5">
💡
</div>

<h3 className="text-2xl font-bold mb-4">

Need genuine advice?

</h3>

<p className="text-gray-400 leading-7">

Ask seniors.

Help juniors.

Build your reputation by helping real students.

</p>

</div>

</div>

</section>
</FadeIn>
{/* ==========================================================
    WHAT IS EGGPUFF
========================================================== */}
<FadeIn>
<section className="max-w-5xl mx-auto px-6 py-16 md:py-24">

<div className="text-center">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

MEET EGGPUFF

</p>

<h2 className="text-3xl
sm:text-4xl
md:text-6xl font-bold">

One app.

Every campus conversation.

</h2>

<p className="mt-8 text-gray-400 max-w-3xl mx-auto leading-8 text-lg">

EggPuff is a private student community
built for colleges.

Ask questions.

Share knowledge.

Meet classmates.

Grow together.

No random strangers.

Only your campus.

</p>

<button

onClick={() => router.push("/what-is-eggpuff")}

className="mt-10 px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition"

>

Learn more →

</button>

</div>

</section>
</FadeIn>
{/* ==========================================================
    WHY DIFFERENT
========================================================== */}
<FadeIn>
<section className="max-w-6xl mx-auto px-6 py-20 md:py-28">

<div className="text-center mb-20">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

WHY EGGPUFF

</p>

<h2 className="text-3xl
sm:text-4xl
md:text-6xl font-bold">

Built for campuses.

Not the internet.

</h2>

</div>

<div className="grid md:grid-cols-2 gap-10">

<div className="rounded-3xl bg-red-500/5 border border-red-400/10 p-8">

<h3 className="text-2xl font-bold mb-6">

Everywhere else

</h3>

<ul className="space-y-5 text-gray-400">

<li>• Random strangers</li>

<li>• Spam</li>

<li>• Fake engagement</li>

<li>• Irrelevant posts</li>

<li>• Endless scrolling</li>

</ul>

</div>

<div className="rounded-3xl bg-orange-500/10 border border-orange-400/20 p-8">

<h3 className="text-2xl font-bold mb-6">

Inside EggPuff

</h3>

<ul className="space-y-5">

<li>✓ Only your college students</li>

<li>✓ Real answers</li>

<li>✓ Genuine friendships</li>

<li>✓ Discover opportunities</li>

<li>✓ Help people & earn EggPuffs</li>

</ul>

</div>

</div>

</section>
</FadeIn>
      {/* ==========================================================
    SEE EGGPUFF IN ACTION
========================================================== */}
<FadeIn>
<section className="max-w-7xl mx-auto px-6 py-20 md:py-32">

<div className="text-center mb-20">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

SEE EGGPUFF

</p>

<h2 className="text-3xl
sm:text-4xl
md:text-6xl font-bold">

Looks familiar.

Feels different.

</h2>

<p className="mt-8 max-w-3xl mx-auto text-lg leading-8 text-gray-400">

Built to feel as simple as your favorite social apps,
but focused entirely on your college community.

</p>

</div>

{/* Preview */}

<div className="grid lg:grid-cols-3 gap-5 md:gap-8">

{/* Feed */}

<div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

<div className="px-6 py-5 border-b border-white/10 font-semibold">

Campus Feed

</div>

<div className="p-6 space-y-5">

<div className="bg-black/40 rounded-2xl p-5">

<div className="font-semibold">

Anyone interested in building an AI startup?

</div>

<div className="mt-3 text-sm text-gray-400">

💬 12 replies

❤️ 48 helpful

</div>

</div>

<div className="bg-black/40 rounded-2xl p-5">

<div className="font-semibold">

Selling ML handwritten notes.

</div>

<div className="mt-3 text-sm text-gray-400">

💬 7 replies

</div>

</div>

<div className="bg-black/40 rounded-2xl p-5">

<div className="font-semibold">

Looking for football teammates.

</div>

<div className="mt-3 text-sm text-gray-400">

💬 Active now

</div>

</div>

</div>

</div>

{/* Notifications */}

<div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

<div className="px-6 py-5 border-b border-white/10 font-semibold">

Notifications

</div>

<div className="p-6 space-y-4">

<div className="bg-black/40 rounded-xl p-4">

<strong>@rahul</strong>

liked your answer.

</div>

<div className="bg-black/40 rounded-xl p-4">

<strong>@sneha</strong>

started following you.

</div>

<div className="bg-black/40 rounded-xl p-4">

<strong>@aditya</strong>

answered your question.

</div>

<div className="bg-black/40 rounded-xl p-4">

🥚 EggPuff

Fresh conversations are waiting.

</div>

</div>

</div>

{/* Profile */}

<div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

<div className="px-6 py-5 border-b border-white/10 font-semibold">

Profile

</div>

<div className="p-8 text-center">

<div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-300 mx-auto mb-5"/>

<div className="text-2xl font-bold">

Akhil

</div>

<div className="text-gray-400 mb-8">

@akhil

</div>

<div className="grid grid-cols-3 gap-4">

<div>

<div className="font-bold text-xl">

214

</div>

<div className="text-xs text-gray-500">

EggPuffs

</div>

</div>

<div>

<div className="font-bold text-xl">

18

</div>

<div className="text-xs text-gray-500">

Answers

</div>

</div>

<div>

<div className="font-bold text-xl">

31

</div>

<div className="text-xs text-gray-500">

Friends

</div>

</div>

</div>

</div>

</div>

</div>

</section>
</FadeIn>
{/* ==========================================================
    A DAY ON EGGPUFF
========================================================== */}
<FadeIn>
<section className="max-w-5xl mx-auto px-6 py-16 md:py-24">

<div className="text-center mb-20">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

YOUR DAY

</p>

<h2 className="text-3xl
sm:text-4xl
md:text-6xl font-bold">

One day.

Thousands of possibilities.

</h2>

</div>

<div className="relative">

<div className="absolute left-4 top-0 bottom-0 w-px bg-white/10"/>

<div className="space-y-14">

<div className="relative pl-14">

<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">

☀️

</div>

<h3 className="font-bold text-xl">

8:30 AM

</h3>

<p className="text-gray-400 mt-2">

Someone asks for today's class notes.

</p>

</div>

<div className="relative pl-14">

<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">

💬

</div>

<h3 className="font-bold text-xl">

10:15 AM

</h3>

<p className="text-gray-400 mt-2">

You answer.

They thank you.

You earn EggPuffs.

</p>

</div>

<div className="relative pl-14">

<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">

🤝

</div>

<h3 className="font-bold text-xl">

2:00 PM

</h3>

<p className="text-gray-400 mt-2">

You find teammates for a hackathon.

</p>

</div>

<div className="relative pl-14">

<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">

🚀

</div>

<h3 className="font-bold text-xl">

7:00 PM

</h3>

<p className="text-gray-400 mt-2">

You discover an internship shared by another student.

</p>

</div>

</div>

</div>

</section>
</FadeIn>
{/* ==========================================================
    LIVE STATS
========================================================== */}
<FadeIn>
<section className="max-w-6xl mx-auto px-6 py-16 md:py-24">

<div className="grid md:grid-cols-4 gap-8">

<div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">

<div className="text-5xl font-black">

{epCount}+

</div>

<div className="mt-3 text-gray-400">

EggPuffs Earned

</div>

</div>

<div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">

<div className="text-5xl font-black">

100%

</div>

<div className="mt-3 text-gray-400">

Real Students

</div>

</div>

<div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">

<div className="text-5xl font-black">

∞

</div>

<div className="mt-3 text-gray-400">

Questions

</div>

</div>

<div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">

<div className="text-5xl font-black">

24/7

</div>

<div className="mt-3 text-gray-400">

Campus Activity

</div>

</div>

</div>

</section>
</FadeIn>
      {/* ==========================================================
    FINAL CTA
========================================================== */}
<FadeIn>
<section className="relative overflow-hidden py-24 md:py-32">

<div className="absolute inset-0">

<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-orange-500/10 blur-[220px]" />

</div>

<div className="relative max-w-4xl mx-auto px-6 text-center">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

YOUR CAMPUS IS WAITING

</p>

<h2 className="text-5xl md:text-7xl font-black leading-tight">

Don't miss

<br />

what's happening

<br />

around you.

</h2>

<p className="mt-10 text-xl text-gray-400 leading-9 max-w-2xl mx-auto">

Every day students ask questions,

share opportunities,

find teammates,

make friends,

and help each other.

Be part of it.

</p>

<div className="flex flex-wrap justify-center gap-5 mt-14">

<button

onClick={() => router.push('/login')}

className="px-10 py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg hover:scale-105 active:scale-95 transition"

>

Join Your Campus

</button>

<button

onClick={() => router.push('/what-is-eggpuff')}

className="px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/5 transition"

>

Learn More

</button>

</div>

<div className="mt-10 flex justify-center flex-wrap gap-8 text-sm text-gray-500">

<div>

✓ Google Sign-In

</div>

<div>

✓ No Passwords

</div>

<div>

✓ No Spam

</div>

<div>

✓ Campus Only

</div>

</div>

</div>

</section>
</FadeIn>
{/* ==========================================================
    FAQ
========================================================== */}
<FadeIn>
<section className="max-w-4xl mx-auto px-6 py-16 md:py-24">

<div className="text-center mb-16">

<p className="uppercase tracking-[0.3em] text-orange-400 text-sm mb-5">

QUESTIONS

</p>

<h2 className="text-4xl md:text-5xl font-bold">

Frequently Asked

Questions

</h2>

</div>

<div className="space-y-5">

<div className="rounded-2xl border border-white/10 bg-white/5 p-6">

<h3 className="font-semibold text-lg">

Is EggPuff free?

</h3>

<p className="mt-3 text-gray-400">

Yes.

EggPuff is completely free for students.

</p>

</div>

<div className="rounded-2xl border border-white/10 bg-white/5 p-6">

<h3 className="font-semibold text-lg">

Can students from other colleges see my questions?

</h3>

<p className="mt-3 text-gray-400">

No.

Everything stays inside your own college community.

</p>

</div>

<div className="rounded-2xl border border-white/10 bg-white/5 p-6">

<h3 className="font-semibold text-lg">

How do I join?

</h3>

<p className="mt-3 text-gray-400">

Simply sign in using Google and choose your college.

</p>

</div>

<div className="rounded-2xl border border-white/10 bg-white/5 p-6">

<h3 className="font-semibold text-lg">

Why EggPuff?

</h3>

<p className="mt-3 text-gray-400">

Because students deserve a space built for learning,

helping,

and growing together—not endless scrolling.

</p>

</div>

</div>

</section>
</FadeIn>

{/* ==========================================================
    FOOTER
========================================================== */}

<footer
  className="
    mt-24
    border-t
    border-white/5
    bg-gradient-to-b
    from-transparent
    to-white/[0.02]
  "
>
  <div className="max-w-7xl mx-auto px-6 py-20">

    <div className="grid grid-cols-1 md:grid-cols-4 gap-14">

      {/* ====================================================== */}
      {/* BRAND */}
      {/* ====================================================== */}

      <div>

        <div className="flex items-center gap-4">

          <div
            className="
              w-14
              h-14
              rounded-full
              bg-white
              flex
              items-center
              justify-center
              shadow-xl
              overflow-hidden
              shrink-0
            "
          >
            <img
              src="/icon-512.png"
              alt="EggPuff"
              className="w-12 h-12 object-contain"
            />
          </div>

          <div>

            <h3 className="text-2xl font-bold tracking-tight">
              EggPuff
            </h3>

            <p className="text-sm text-gray-500">
              Your campus. One place.
            </p>

          </div>

        </div>

        <p className="mt-6 max-w-xs text-gray-400 leading-7">
          Helping students learn, connect, and grow—
          one campus conversation at a time.
        </p>

      </div>

      {/* ====================================================== */}
      {/* PRODUCT */}
      {/* ====================================================== */}

      <div>

        <h4 className="mb-6 text-white font-semibold tracking-wide">
          Product
        </h4>

        <nav className="flex flex-col gap-4">

          <button
            onClick={() => router.push("/what-is-eggpuff")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            What is EggPuff?
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Join Campus
          </button>

          <button
            onClick={() => router.push("/support")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Support
          </button>

          <button
            onClick={() => router.push("/contact")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Contact
          </button>

        </nav>

      </div>

      {/* ====================================================== */}
      {/* LEGAL */}
      {/* ====================================================== */}

      <div>

        <h4 className="mb-6 text-white font-semibold tracking-wide">
          Legal
        </h4>

        <nav className="flex flex-col gap-4">

          <button
            onClick={() => router.push("/privacy")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Privacy Policy
          </button>

          <button
            onClick={() => router.push("/terms")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Terms & Conditions
          </button>

          <button
            onClick={() => router.push("/community-guidelines")}
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Community Guidelines
          </button>

        </nav>

      </div>

      {/* ====================================================== */}
      {/* CONNECT */}
      {/* ====================================================== */}

      <div>

        <h4 className="mb-6 text-white font-semibold tracking-wide">
          Connect
        </h4>

        <nav className="flex flex-col gap-4">

          <a
            href="https://www.instagram.com/eggpuff.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Instagram
          </a>

          <a
            href="https://www.threads.com/@eggpuffthreads"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Threads
          </a>

          <a
            href="https://www.facebook.com/share/191qx1YdMM/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Facebook
          </a>

          <a
            href="mailto:support@eggpuff.in"
            className="w-fit text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700 hover:decoration-white"
          >
            Email
          </a>

        </nav>

      </div>

    </div>

    {/* ====================================================== */}
    {/* BOTTOM BAR */}
    {/* ====================================================== */}

    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">

      <p className="text-sm text-gray-500">
        © 2026 EggPuff. Built for college students.
      </p>

      <p className="text-sm text-gray-500">
        Made with ❤️ in India.
      </p>

    </div>

  </div>
</footer>

    </main>
  )
}