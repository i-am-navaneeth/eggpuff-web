import http from 'k6/http'
import { check, sleep } from 'k6'

// ============================================================
// ENVIRONMENT
// ============================================================

const BASE_URL =
  (__ENV.BASE_URL || '').replace(/\/+$/, '')

if (!BASE_URL) {
  throw new Error(
    'Missing BASE_URL environment variable.'
  )
}

// ============================================================
// LOAD TARGET
//
// Examples:
//   k6 run -e BASE_URL=https://... -e TARGET_VUS=200 k6/load.js
//   k6 run -e BASE_URL=https://... -e TARGET_VUS=500 k6/load.js
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
//
// Gradually ramp to the requested target.
// The same file can therefore test:
// 150 → 200 → 300 → 500 → 750 → 1000...
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

    // Hold at target
    { duration: '30s', target: TARGET_VUS },

    // Ramp down
    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_failed: [
      'rate<0.01',
    ],

    http_req_duration: [
      'p(95)<1000',
      'p(99)<1500',
    ],
  },
}

// ============================================================
// TEST
// ============================================================

export default function () {
  const url =
    `${BASE_URL}/api/debug`

  const res =
    http.get(url, {
      tags: {
        test: 'load',
        endpoint: 'debug',
      },
    })

  const contentType =
    res.headers['Content-Type'] || 'unknown'

  const location =
    res.headers['Location'] || ''

  check(res, {
    'debug status is 200':
      (r) => r.status === 200,

    'debug returns JSON':
      (r) =>
        (
          r.headers['Content-Type'] || ''
        )
          .toLowerCase()
          .includes('application/json'),

    'debug response has body':
      (r) =>
        !!r.body &&
        r.body.length > 0,
  })

  // ==========================================================
  // DIAGNOSTIC — ONCE
  // ==========================================================

  if (__VU === 1 && __ITER === 0) {
    console.log(
      `\n===== ${TARGET_VUS} VU LOAD TEST DIAGNOSTIC =====`
    )

    console.log(`URL: ${url}`)
    console.log(`TARGET VUs: ${TARGET_VUS}`)
    console.log(`STATUS: ${res.status}`)
    console.log(`CONTENT-TYPE: ${contentType}`)
    console.log(
      `LOCATION: ${location || 'none'}`
    )

    console.log(
      `TIME: ${res.timings.duration.toFixed(2)}ms`
    )

    console.log(
      `RESPONSE SIZE: ${
        res.body
          ? res.body.length
          : 0
      } bytes`
    )

    console.log(
      `BODY: ${
        res.body
          ? res.body.substring(0, 500)
          : '(empty)'
      }`
    )

    console.log(
      '=======================================\n'
    )
  }

  sleep(1)
}