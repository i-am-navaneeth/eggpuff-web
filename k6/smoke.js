import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL

if (!BASE_URL) {
  throw new Error('Missing BASE_URL environment variable.')
}

export const options = {
  vus: 5,
  duration: '30s',

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
}

export default function () {
  const res = http.get(`${BASE_URL}/`)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => !!r.body,
  })

  sleep(1)
}