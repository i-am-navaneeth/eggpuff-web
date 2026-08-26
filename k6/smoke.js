import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(__ENV.BASE_URL, {
    tags: {
      test: 'dev-smoke',
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}