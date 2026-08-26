import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const SUPABASE_URL = __ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN;
const USER_ID = __ENV.USER_ID;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ACCESS_TOKEN || !USER_ID) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, ACCESS_TOKEN, USER_ID'
  );
}

const ttfb = new Trend('ttfb');
const responseSize = new Trend('response_size_bytes');
const connecting = new Trend('connecting');
const tlsHandshake = new Trend('tls_handshaking');
const waiting = new Trend('waiting');
const receiving = new Trend('receiving');
const blocked = new Trend('blocked');

export const options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '20s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    ttfb: ['p(95)<400', 'p(99)<800'],
  },
};

export default function () {
  const url =
    `${SUPABASE_URL}/rest/v1/rpc/get_smart_feed`;

  const payload = JSON.stringify({
    p_user_id: USER_ID,
    p_limit: 6,
    p_offset: 0,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },

    tags: {
      endpoint: 'get_smart_feed',
    },
  };

  const res = http.post(url, payload, params);

  ttfb.add(res.timings.waiting);
  responseSize.add(res.body.length);

  connecting.add(res.timings.connecting);
  tlsHandshake.add(res.timings.tls_handshaking);
  waiting.add(res.timings.waiting);
  receiving.add(res.timings.receiving);
  blocked.add(res.timings.blocked);

  if (__VU === 1 && __ITER < 3) {
    console.log(`STATUS: ${res.status}`);
    console.log(`BODY: ${res.body}`);
    console.log(`SIZE: ${res.body.length} bytes`);

    console.log(
      `TIMINGS:
      blocked=${res.timings.blocked}ms
      connecting=${res.timings.connecting}ms
      tls=${res.timings.tls_handshaking}ms
      sending=${res.timings.sending}ms
      waiting=${res.timings.waiting}ms
      receiving=${res.timings.receiving}ms
      total=${res.timings.duration}ms`
    );
  }

  check(res, {
    'feed status 200': (r) => r.status === 200,

    'feed returned array': (r) => {
      try {
        return Array.isArray(r.json());
      } catch {
        return false;
      }
    },
  });
}