import http from 'k6/http'
import { check } from 'k6'
import { Trend } from 'k6/metrics'

// ============================================================
// ENVIRONMENT
// ============================================================

const SUPABASE_URL =
  __ENV.SUPABASE_URL

const SUPABASE_ANON_KEY =
  __ENV.SUPABASE_ANON_KEY

const ACCESS_TOKEN =
  __ENV.ACCESS_TOKEN

const USER_ID =
  __ENV.USER_ID

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !ACCESS_TOKEN ||
  !USER_ID
) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, ACCESS_TOKEN, USER_ID'
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
// METRICS
// ============================================================

const ttfb =
  new Trend('ttfb')

const eligibilityTime =
  new Trend(
    'communities_eligibility'
  )

const joinedTime =
  new Trend(
    'communities_joined'
  )

const exploreTime =
  new Trend(
    'communities_explore'
  )

const responseSize =
  new Trend(
    'response_size_bytes'
  )

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

    { duration: '30s', target: TARGET_VUS },

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
// TEST
// ============================================================

export default function () {
  const headers = {
    'Content-Type':
      'application/json',

    apikey:
      SUPABASE_ANON_KEY,

    Authorization:
      `Bearer ${ACCESS_TOKEN}`,
  }

  // ==========================================================
  // 1. ELIGIBILITY
  // ==========================================================

  const eligibilityStart =
    Date.now()

  const eligibility =
    http.post(
      `${SUPABASE_URL}/rest/v1/rpc/can_create_community`,
      JSON.stringify({
        p_user_id: USER_ID,
      }),
      {
        headers,

        tags: {
          test: 'communities',
          endpoint:
            'communities_eligibility',
        },
      }
    )

  const eligibilityDuration =
    Date.now() -
    eligibilityStart

  eligibilityTime.add(
    eligibilityDuration
  )

  ttfb.add(
    eligibility.timings.waiting
  )

  responseSize.add(
    eligibility.body
      ? eligibility.body.length
      : 0
  )

  // ==========================================================
  // 2. JOINED COMMUNITIES
  // ==========================================================

  const joinedStart =
    Date.now()

  const joined =
    http.get(
      `${SUPABASE_URL}/rest/v1/community_members` +
        `?select=communities(id,name,slug,description,members_count,avatar_url,banner_url)` +
        `&user_id=eq.${USER_ID}`,
      {
        headers,

        tags: {
          test: 'communities',
          endpoint:
            'communities_joined',
        },
      }
    )

  const joinedDuration =
    Date.now() -
    joinedStart

  joinedTime.add(
    joinedDuration
  )

  ttfb.add(
    joined.timings.waiting
  )

  responseSize.add(
    joined.body
      ? joined.body.length
      : 0
  )

  // ==========================================================
  // 3. EXPLORE COMMUNITIES
  // ==========================================================

  const exploreStart =
    Date.now()

  let joinedIds = []

  try {
    const joinedData =
      joined.json()

    if (
      Array.isArray(joinedData)
    ) {
      joinedIds =
        joinedData
          .map(
            (item) =>
              item?.communities?.id
          )
          .filter(Boolean)
    }
  } catch {
    // Invalid response will
    // be caught by checks.
  }

  let exploreUrl =
    `${SUPABASE_URL}/rest/v1/communities` +
    `?select=id,name,slug,description,members_count,avatar_url` +
    `&order=members_count.desc` +
    `&limit=8`

  if (
    joinedIds.length > 0
  ) {
    exploreUrl +=
      `&id=not.in.(${joinedIds.join(',')})`
  }

  const explore =
    http.get(
      exploreUrl,
      {
        headers,

        tags: {
          test: 'communities',
          endpoint:
            'communities_explore',
        },
      }
    )

  const exploreDuration =
    Date.now() -
    exploreStart

  exploreTime.add(
    exploreDuration
  )

  ttfb.add(
    explore.timings.waiting
  )

  responseSize.add(
    explore.body
      ? explore.body.length
      : 0
  )

  // ==========================================================
  // CHECKS
  // ==========================================================

  check(eligibility, {
    'eligibility status 200':
      (r) => r.status === 200,

    'eligibility returned data':
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

  check(joined, {
    'joined communities status 200':
      (r) => r.status === 200,

    'joined communities returned array':
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

  check(explore, {
    'explore communities status 200':
      (r) => r.status === 200,

    'explore communities returned array':
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
      `\n===== COMMUNITIES ${TARGET_VUS} VU TEST =====`
    )

    console.log(
      `TARGET VUs: ${TARGET_VUS}`
    )

    console.log(
      `Eligibility: ${eligibility.status} | ${eligibilityDuration}ms`
    )

    console.log(
      `Joined: ${joined.status} | ${joinedDuration}ms`
    )

    console.log(
      `Joined communities: ${joinedIds.length}`
    )

    console.log(
      `Explore: ${explore.status} | ${exploreDuration}ms`
    )

    console.log(
      `Explore response size: ${
        explore.body
          ? explore.body.length
          : 0
      } bytes`
    )

    console.log(
      '===================================\n'
    )
  }
}