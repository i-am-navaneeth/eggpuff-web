import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      `https://api.cricketdata.org/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}`,
      { cache: "no-store" }
    )

    const data = await res.json()

    const match = data?.data?.[0]

    if (!match) {
      return NextResponse.json({
        team1: "India",
        team2: "England",
        score1: "210/3 (45)",
        score2: "—",
        status: "No live match – demo score"
      })
    }

    const score1 = match.score?.[0]
    const score2 = match.score?.[1]

    return NextResponse.json({
      team1: match.teams?.[0] || "Team A",
      team2: match.teams?.[1] || "Team B",
      score1: score1 ? `${score1.r}/${score1.w} (${score1.o})` : "—",
      score2: score2 ? `${score2.r}/${score2.w} (${score2.o})` : "—",
      status: match.status || "Live"
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json({
      team1: "India",
      team2: "England",
      score1: "210/3 (45)",
      score2: "—",
      status: "Demo fallback"
    })
  }
}