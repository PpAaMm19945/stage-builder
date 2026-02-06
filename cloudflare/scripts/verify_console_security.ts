import crypto from 'node:crypto';

// Polyfill for Cloudflare-specific or missing WebCrypto methods in Node environment
if (globalThis.crypto && globalThis.crypto.subtle && !('timingSafeEqual' in globalThis.crypto.subtle)) {
    // @ts-expect-error - Cloudflare-specific extension not in standard WebCrypto typings.
    globalThis.crypto.subtle.timingSafeEqual = (a: ArrayBuffer, b: ArrayBuffer) => {
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    };
}

import app from '../src/routes/console';

const mockDB = {
  prepare: (query: string) => ({
    bind: (...args: unknown[]) => ({
      first: async () => ({ count: 10 }),
      all: async () => ({ results: [] }),
      run: async () => ({})
    }),
    first: async () => ({ count: 10 }),
    all: async () => ({ results: [] }),
    run: async () => ({})
  })
};

const env = {
  ADMIN_SECRET: 'testsecret',
  DB: mockDB
};

async function run() {
  console.log('Testing fix...');

  // Test with key (should now FAIL)
  const resKey = await app.request('/?key=testsecret', {}, env);
  console.log(`GET /?key=testsecret status: ${resKey.status}`);

  if (resKey.status === 401) {
      console.log('✅ Fix confirmed: ?key=testsecret is now REJECTED');
  } else {
      console.error(`❌ Failed: ?key=testsecret returned ${resKey.status} (expected 401)`);
  }

  // Test without credentials (should FAIL with WWW-Authenticate)
  const resNoKey = await app.request('/', {}, env);
  console.log(`GET / status: ${resNoKey.status}`);

  if (resNoKey.status === 401) {
       const authHeader = resNoKey.headers.get('WWW-Authenticate');
       if (authHeader && authHeader.includes('Basic')) {
           console.log('✅ WWW-Authenticate header present');
       } else {
           console.error('❌ Missing WWW-Authenticate header');
       }
  } else {
       console.log(`⚠️ Unexpected status without key: ${resNoKey.status}`);
  }

  // Test with Basic Auth (should SUCCEED)
  // credentials: admin:testsecret
  const credentials = btoa('admin:testsecret');
  const resAuth = await app.request('/', {
      headers: {
          'Authorization': `Basic ${credentials}`
      }
  }, env);
  console.log(`GET / (Basic Auth) status: ${resAuth.status}`);

  if (resAuth.status === 200) {
      console.log('✅ Basic Auth successful');
  } else {
      console.error(`❌ Basic Auth failed with status ${resAuth.status}`);
      // console.log(await resAuth.text());
  }
}

run().catch(console.error);
