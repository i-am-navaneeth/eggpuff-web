import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'

// ============================================================
// ENVIRONMENT
// ============================================================

const SUPABASE_URL = __ENV.SUPABASE_URL
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN
const USER_ID = __ENV.USER_ID

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
// CUSTOM METRICS
// ============================================================

const ttfb =
  new Trend('ttfb')

const responseSize =
  new Trend('response_size_bytes')

const connecting =
  new Trend('connecting')

const tlsHandshake =
  new Trend('tls_handshaking')

const waiting =
  new Trend('waiting')

const receiving =
  new Trend('receiving')

const blocked =
  new Trend('blocked')

// Counts non-200 feed responses.
// The status code is attached as a tag so we can see
// which type of failure is occurring under high load.
const failedRequests =
  new Counter('feed_failed_requests')

// ============================================================
// LOAD PROFILE
// 10 → 25 → 50 → 75 → 100 → 125 → 150 VUs
// Hold at 150 VUs
// ============================================================

export const options = {
  stages: [
    // Ramp up
    { duration: '20s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 75 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 125 },
    { duration: '30s', target: 150 },

    // Hold at 150 VUs
    { duration: '30s', target: 150 },

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
// TEST
// ============================================================

export default function () {
  const url =
    `${SUPABASE_URL}/rest/v1/rpc/get_smart_feed`

  const payload = JSON.stringify({
    p_user_id: USER_ID,
    p_limit: 6,
    p_offset: 0,
  })

  const params = {
    headers: {
      'Content-Type':
        'application/json',

      apikey:
        SUPABASE_ANON_KEY,

      Authorization:
        `Bearer ${ACCESS_TOKEN}`,
    },

    tags: {
      test: 'safe-api',
      endpoint: 'get_smart_feed',
    },
  }

  const res = http.post(
    url,
    payload,
    params
  )

  // ==========================================================
  // FAILURE DIAGNOSTICS
  // ==========================================================

  if (res.status !== 200) {
    failedRequests.add(1, {
      status: String(res.status),
    })

    // Log a small number of failures so the terminal
    // doesn't get flooded during a high-VU test.
    if (__VU <= 3 && __ITER < 3) {
      console.log(
        `FEED FAILURE | VU=${__VU} ITER=${__ITER} STATUS=${res.status} ERROR=${res.error || 'none'} BODY=${res.body ? res.body.substring(0, 300) : '(empty)'}`
      )
    }
  }

  // ==========================================================
  // TIMING METRICS
  // ==========================================================

  ttfb.add(
    res.timings.waiting
  )

  responseSize.add(
    res.body
      ? res.body.length
      : 0
  )

  connecting.add(
    res.timings.connecting
  )

  tlsHandshake.add(
    res.timings.tls_handshaking
  )

  waiting.add(
    res.timings.waiting
  )

  receiving.add(
    res.timings.receiving
  )

  blocked.add(
    res.timings.blocked
  )

  // ==========================================================
  // CHECKS
  // ==========================================================

  check(res, {
    'feed status 200':
      (r) => r.status === 200,

    'feed returns JSON':
      (r) =>
        (
          r.headers['Content-Type'] ||
          ''
        )
          .toLowerCase()
          .includes(
            'application/json'
          ),

    'feed returned array':
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
  // DIAGNOSTIC — FIRST VU / FIRST ITERATION
  // ==========================================================

  if (__VU === 1 && __ITER === 0) {
    console.log(
      '\n===== SMART FEED LOAD TEST ====='
    )

    console.log(
      `STATUS: ${res.status}`
    )

    console.log(
      `CONTENT-TYPE: ${
        res.headers['Content-Type'] ||
        'unknown'
      }`
    )

    console.log(
      `SIZE: ${
        res.body
          ? res.body.length
          : 0
      } bytes`
    )

    console.log(
      `TIMINGS:
blocked=${res.timings.blocked}ms
connecting=${res.timings.connecting}ms
tls=${res.timings.tls_handshaking}ms
sending=${res.timings.sending}ms
waiting=${res.timings.waiting}ms
receiving=${res.timings.receiving}ms
total=${res.timings.duration}ms`
    )

    console.log(
      '================================\n'
    )
  }

  // ==========================================================
  // REALISTIC USER PAUSE
  // ==========================================================

  sleep(0.5)
}