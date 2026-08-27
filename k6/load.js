import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = (__ENV.BASE_URL || '').replace(/\/+$/, '')

if (!BASE_URL) {
  throw new Error('Missing BASE_URL environment variable.')
}

export const options = {
  stages: [
    // Ramp up
    { duration: '20s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },

    // Hold
    { duration: '30s', target: 50 },

    // Ramp down
    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
}

export default function () {
  const url = `${BASE_URL}/api/debug`

  const res = http.get(url, {
    tags: {
      test: 'load',
      endpoint: 'debug',
    },
  })

  const contentType = res.headers['Content-Type'] || 'unknown'
  const location = res.headers['Location'] || ''

  check(res, {
    'debug status is 200': (r) => r.status === 200,

    'debug returns JSON': (r) =>
      (r.headers['Content-Type'] || '')
        .toLowerCase()
        .includes('application/json'),

    'debug response has body': (r) =>
      !!r.body && r.body.length > 0,
  })

  // Diagnostic output only once.
  // Prevents 50 VUs from flooding the terminal.
  if (__VU === 1 && __ITER === 0) {
    console.log('\n===== LOAD TEST DIAGNOSTIC =====')
    console.log(`URL: ${url}`)
    console.log(`STATUS: ${res.status}`)
    console.log(`CONTENT-TYPE: ${contentType}`)
    console.log(`LOCATION: ${location || 'none'}`)
    console.log(`TIME: ${res.timings.duration.toFixed(2)}ms`)
    console.log(`RESPONSE SIZE: ${res.body ? res.body.length : 0} bytes`)
    console.log(
      `BODY: ${res.body ? res.body.substring(0, 500) : '(empty)'}`
    )
    console.log('================================\n')
  }

  sleep(1)
}