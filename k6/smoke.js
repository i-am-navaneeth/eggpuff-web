import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL;

if (!BASE_URL) {
  throw new Error('BASE_URL is required');
}

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const res = http.get(`${BASE_URL}/`);

  console.log('\n===== DEV SMOKE DIAGNOSTIC =====');
  console.log(`URL: ${BASE_URL}/`);
  console.log(`STATUS: ${res.status}`);
  console.log(`STATUS TEXT: ${res.status_text}`);
  console.log(`CONTENT-TYPE: ${res.headers['Content-Type'] || 'unknown'}`);
  console.log(`BODY: ${res.body.substring(0, 1000)}`);
  console.log(`TIME: ${res.timings.duration.toFixed(2)}ms`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => r.body && r.body.length > 0,
  });
}