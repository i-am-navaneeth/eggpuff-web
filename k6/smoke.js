import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = (__ENV.BASE_URL || '').replace(/\/+$/, '');

if (!BASE_URL) {
  throw new Error('BASE_URL is required');
}

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const url = `${BASE_URL}/`;

  const res = http.get(url, {
    tags: {
      test: 'dev-smoke',
      endpoint: 'homepage',
    },
  });

  console.log('\n===== DEV SMOKE TEST =====');
  console.log(`URL: ${url}`);
  console.log(`STATUS: ${res.status} ${res.status_text}`);
  console.log(
    `CONTENT-TYPE: ${res.headers['Content-Type'] || 'unknown'}`
  );
  console.log(`TIME: ${res.timings.duration.toFixed(2)}ms`);
  console.log(`RESPONSE SIZE: ${res.body ? res.body.length : 0} bytes`);

  if (res.status !== 200) {
    console.log(`BODY: ${(res.body || '').substring(0, 1000)}`);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => !!r.body && r.body.length > 0,
  });
}