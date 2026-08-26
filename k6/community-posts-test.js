import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

// ============================================================
// CONFIG — READ FROM POWERSHELL ENVIRONMENT
// ============================================================

const SUPABASE_URL =
  __ENV.SUPABASE_URL

const SUPABASE_ANON_KEY =
  __ENV.SUPABASE_ANON_KEY

const ACCESS_TOKEN =
  __ENV.ACCESS_TOKEN

// FF Community
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
// TEST CONFIG
// ============================================================

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 400 },
    { duration: '30s', target: 0 },
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
};

// ============================================================
// CUSTOM METRICS
// ============================================================

const communityLoad =
  new Trend('community_load')

const membershipCheck =
  new Trend('membership_check')

const communityPostsLoad =
  new Trend('community_posts_load')

const responseSize =
  new Trend('response_size_bytes')

const ttfb =
  new Trend('ttfb')

// ============================================================
// HEADERS
// ============================================================

const headers = {

  'apikey':
    SUPABASE_ANON_KEY,

  'Authorization':
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
          name,
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

  check(
    community,
    {
      'community status 200':
        (r) => r.status === 200,

      'community returned array':
        (r) => {
          try {
            return Array.isArray(
              JSON.parse(r.body)
            )
          } catch {
            return false
          }
        },
    }
  )

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

  check(
    membership,
    {
      'membership status 200':
        (r) => r.status === 200,

      'membership returned array':
        (r) => {
          try {
            return Array.isArray(
              JSON.parse(r.body)
            )
          } catch {
            return false
          }
        },
    }
  )

  // ==========================================================
  // 3. COMMUNITY POSTS
  //
  // Community posts are questions with community_id.
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

  check(
    posts,
    {
      'posts status 200':
        (r) => r.status === 200,

      'posts returned array':
        (r) => {
          try {
            return Array.isArray(
              JSON.parse(r.body)
            )
          } catch {
            return false
          }
        },
    }
  )

  // ==========================================================
  // LOG FIRST ITERATION ONLY
  // ==========================================================

  if (__ITER === 0) {

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
        JSON.parse(posts.body)

      console.log(
        `POST COUNT: ${data.length}`
      )

    } catch {}

  }

  sleep(0.2)
}