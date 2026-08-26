import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
}

export default function () {
  const res = http.get(`${BASE_URL}/api/debug`)

  check(res, {
    'debug status is 200': (r) => r.status === 200,
    'debug returns JSON': (r) =>
      r.headers['Content-Type']?.includes('application/json'),
  })

  sleep(1)
}