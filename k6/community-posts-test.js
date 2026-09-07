import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

// ============================================================
// CONFIG
// ============================================================

const SUPABASE_URL =
  __ENV.SUPABASE_URL

const SUPABASE_ANON_KEY =
  __ENV.SUPABASE_ANON_KEY

const ACCESS_TOKEN =
  __ENV.ACCESS_TOKEN

const COMMUNITY_ID =
  '3c8c9290-a62c-4d69-ac8c-2b08316a0d0a'

// ============================================================
// SAFETY CHECK
// ============================================================

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !ACCESS_TOKEN
) {
  throw new Error(
    'Missing SUPABASE_URL, SUPABASE_ANON_KEY, or ACCESS_TOKEN environment variable.'
  )
}

// ============================================================
// LOAD TARGET
// ============================================================

const TARGET_VUS =
  Number(__ENV.TARGET_VUS || 150)

if (
  !Number.isInteger(TARGET_VUS) ||
  TARGET_VUS < 1
) {
  throw new Error(
    'TARGET_VUS must be a positive integer.'
  )
}

// ============================================================
// LOAD PROFILE
// ============================================================

export const options = {
  stages: [
    { duration: '20s', target: Math.round(TARGET_VUS * 0.07) },
    { duration: '30s', target: Math.round(TARGET_VUS * 0.17) },
    { duration: '30s', target: Math.round(TARGET_VUS * 0.33) },
    { duration: '30s', target: Math.round(TARGET_VUS * 0.50) },
    { duration: '30s', target: Math.round(TARGET_VUS * 0.67) },
    { duration: '30s', target: Math.round(TARGET_VUS * 0.83) },
    { duration: '30s', target: TARGET_VUS },

    // Hold
    { duration: '30s', target: TARGET_VUS },

    // Ramp down
    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_duration: [
      'p(95)<500',
      'p(99)<1000',
    ],

    http_req_failed: [
      'rate<0.01',
    ],

    ttfb: [
      'p(95)<400',
      'p(99)<800',
    ],
  },
}

// ============================================================
// CUSTOM METRICS
// ============================================================

const communityLoad =
  new Trend(
    'community_load'
  )

const membershipCheck =
  new Trend(
    'membership_check'
  )

const communityPostsLoad =
  new Trend(
    'community_posts_load'
  )

const responseSize =
  new Trend(
    'response_size_bytes'
  )

const ttfb =
  new Trend('ttfb')

// ============================================================
// HEADERS
// ============================================================

const headers = {
  apikey:
    SUPABASE_ANON_KEY,

  Authorization:
    `Bearer ${ACCESS_TOKEN}`,

  'Content-Type':
    'application/json',
}

// ============================================================
// REQUEST HELPER
// ============================================================

function request(
  url,
  metric,
  name
) {
  const res =
    http.get(
      url,
      {
        headers,

        tags: {
          test: 'community-posts',
          endpoint: name,
        },
      }
    )

  metric.add(
    res.timings.duration
  )

  ttfb.add(
    res.timings.waiting
  )

  responseSize.add(
    res.body
      ? res.body.length
      : 0
  )

  return res
}

// ============================================================
// TEST
// ============================================================

export default function () {
  // ==========================================================
  // 1. COMMUNITY
  // ==========================================================

  const communityUrl =
    `${SUPABASE_URL}/rest/v1/communities` +
    `?id=eq.${COMMUNITY_ID}` +
    `&select=id,name,slug,description,members_count`

  const community =
    request(
      communityUrl,
      communityLoad,
      'community'
    )

  check(community, {
    'community status 200':
      (r) => r.status === 200,

    'community returns JSON':
      (r) =>
        (
          r.headers['Content-Type'] ||
          ''
        )
          .toLowerCase()
          .includes(
            'application/json'
          ),

    'community returned array':
      (r) => {
        try {
          return Array.isArray(
            r.json()
          )
        } catch {
          return false
        }
      },
  })

  // ==========================================================
  // 2. MEMBERSHIP
  // ==========================================================

  const membershipUrl =
    `${SUPABASE_URL}/rest/v1/community_members` +
    `?community_id=eq.${COMMUNITY_ID}` +
    `&select=community_id,user_id` +
    `&limit=1`

  const membership =
    request(
      membershipUrl,
      membershipCheck,
      'membership'
    )

  check(membership, {
    'membership status 200':
      (r) => r.status === 200,

    'membership returns JSON':
      (r) =>
        (
          r.headers['Content-Type'] ||
          ''
        )
          .toLowerCase()
          .includes(
            'application/json'
          ),

    'membership returned array':
      (r) => {
        try {
          return Array.isArray(
            r.json()
          )
        } catch {
          return false
        }
      },
  })

  // ==========================================================
  // 3. COMMUNITY POSTS
  // ==========================================================

  const postsUrl =
    `${SUPABASE_URL}/rest/v1/questions` +
    `?community_id=eq.${COMMUNITY_ID}` +
    `&select=*` +
    `&order=created_at.desc` +
    `&limit=20`

  const posts =
    request(
      postsUrl,
      communityPostsLoad,
      'community_posts'
    )

  check(posts, {
    'posts status 200':
      (r) => r.status === 200,

    'posts returns JSON':
      (r) =>
        (
          r.headers['Content-Type'] ||
          ''
        )
          .toLowerCase()
          .includes(
            'application/json'
          ),

    'posts returned array':
      (r) => {
        try {
          return Array.isArray(
            r.json()
          )
        } catch {
          return false
        }
      },
  })

  // ==========================================================
  // DIAGNOSTIC
  // ==========================================================

  if (__VU === 1 && __ITER === 0) {
    console.log(
      `\n===== COMMUNITY ${TARGET_VUS} VU TEST =====`
    )

    console.log(
      `TARGET VUs: ${TARGET_VUS}`
    )

    console.log(
      '\n===== COMMUNITY ====='
    )

    console.log(
      `STATUS: ${community.status}`
    )

    console.log(
      `TIME: ${community.timings.duration.toFixed(2)}ms`
    )

    console.log(
      `BODY: ${community.body}`
    )

    console.log(
      '\n===== MEMBERSHIP ====='
    )

    console.log(
      `STATUS: ${membership.status}`
    )

    console.log(
      `TIME: ${membership.timings.duration.toFixed(2)}ms`
    )

    console.log(
      `BODY: ${membership.body}`
    )

    console.log(
      '\n===== COMMUNITY POSTS ====='
    )

    console.log(
      `STATUS: ${posts.status}`
    )

    console.log(
      `TIME: ${posts.timings.duration.toFixed(2)}ms`
    )

    console.log(
      `BODY: ${posts.body}`
    )

    try {
      const data =
        posts.json()

      console.log(
        `POST COUNT: ${
          Array.isArray(data)
            ? data.length
            : 0
        }`
      )
    } catch {
      console.log(
        'POST COUNT: unable to parse response'
      )
    }

    console.log(
      '=================================\n'
    )
  }

  sleep(0.2)
}