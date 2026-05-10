import { NextRequest, NextResponse } from 'next/server'
import { isBlockedDomain } from '@/lib/isBlockedDomain'
import { getLinkType } from '@/lib/getLinkType'

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json()

    const url = body?.url

    // 🔒 basic validation
    if (
      !url ||
      typeof url !== 'string' ||
      (
        !url.startsWith('http://') &&
        !url.startsWith('https://')
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    if (isBlockedDomain(url)) {
  return NextResponse.json(
    {
      error: 'Blocked domain',
    },
    { status: 403 }
  )
}

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 EggPuffBot',
      },
    })

    const html = await res.text()

    // 🔥 tiny helper
    const getMeta = (
      property: string
    ) => {
      const regex = new RegExp(
        `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
        'i'
      )

      return html.match(regex)?.[1] || ''
    }

    const getTitle = () => {
      const match = html.match(
        /<title>(.*?)<\/title>/i
      )

      return match?.[1] || ''
    }

    const hostname = new URL(url)
      .hostname
      .replace('www.', '')

    const data = {
      url,
      type: getLinkType(url),

      title:
        getMeta('og:title') ||
        getTitle() ||
        hostname,

      description:
        getMeta('og:description') || '',

      image:
        getMeta('og:image') || '',

      domain: hostname,
    }

    return NextResponse.json(data)

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    )
  }
}