import { NextResponse } from 'next/server'
import { checkScoreAndNotify } from '@/lib/scoreWatcher'

export async function GET() {
  await checkScoreAndNotify()

  return NextResponse.json({ checked: true })
}