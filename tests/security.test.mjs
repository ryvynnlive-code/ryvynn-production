import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadTs(file, imports = {}, env = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    if (!(name in imports)) throw new Error('Unexpected import: ' + name);
    return imports[name];
  }, process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fixture', ...env } },
  crypto: globalThis.crypto, TextEncoder, TextDecoder, Uint8Array, btoa, atob });
  return exports;
}

test('private API authentication rejects missing, forged and cross-user tokens', async () => {
  const calls = [];
  const { requireApiUser } = loadTs('lib/api-auth.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ ...options, body }) } },
    '@supabase/supabase-js': { createClient: () => ({ auth: { getUser: async token => {
      calls.push(token);
      return token === 'valid' ? { data: { user: { id: 'owner' } }, error: null } : { data: { user: null }, error: new Error('Invalid') };
    } } }) },
  });
  const request = token => new Request('https://example.test/api/journal', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  assert.equal((await requireApiUser(request(), 'owner')).status, 401);
  assert.equal(calls.length, 0);
  assert.equal((await requireApiUser(request('forged'), 'owner')).status, 401);
  assert.equal((await requireApiUser(request('valid'), 'victim')).status, 403);
  assert.equal(await requireApiUser(request('valid'), 'owner'), null);
});

test('wall rejects forged attribution before database writes and keeps anonymous posting available', async () => {
  const inserted = [];
  const rewards = [];
  const { POST } = loadTs('app/api/wall/route.ts', {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ status: options.status || 200, body }) } },
    '@/lib/api-auth': { requireApiUser: async (req, userId) =>
      req.headers.get('authorization') === 'Bearer valid' && userId === 'owner'
        ? null : { status: 401 } },
    '@supabase/supabase-js': { createClient: () => ({
      from: () => ({ insert: row => {
        inserted.push(row);
        return { select: () => ({ single: async () => ({ data: { id: 'entry' }, error: null }) }) };
      } }),
      rpc: async (...args) => { rewards.push(args); return { error: null }; },
    }) },
  }, { SUPABASE_SERVICE_ROLE_KEY: 'server-fixture-only' });
  const request = (body, token) => new Request('https://example.test/api/wall', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body),
  });
  assert.equal((await POST(request({ confession: 'A hopeful day', userId: 'victim', isAnonymous: false }))).status, 401);
  assert.equal((await POST(request({ confession: 'A hopeful day', userId: 'victim' }, 'valid'))).status, 401);
  assert.equal(inserted.length, 0);
  assert.equal(rewards.length, 0);
  assert.equal((await POST(request({ confession: { unexpected: 'object' } }))).status, 400);
  assert.equal((await POST(request({ confession: 'A hopeful day', transformation: [] }))).status, 400);
  assert.equal((await POST(request({ confession: 'x'.repeat(10001) }))).status, 400);
  const anonymous = await POST(request({ confession: 'A hopeful day' }));
  assert.equal(anonymous.status, 200);
  assert.equal(anonymous.body.tokensEarned, 0);
  assert.equal(inserted[0].user_id, null);
  assert.equal(rewards.length, 0);
  const owner = await POST(request({ confession: 'A hopeful day', userId: 'owner', isAnonymous: false }, 'valid'));
  assert.equal(owner.status, 200);
  assert.equal(inserted[1].user_id, 'owner');
  assert.equal(rewards[0][1].user_uuid, 'owner');
});

test('journal ciphertext survives reload and rejects wrong passwords and tampering', async () => {
  const first = loadTs('lib/encryption.ts');
  const ciphertext = await first.encrypt('Private fixture — never production data', 'strong-test-passphrase');
  assert.ok(!ciphertext.includes('Private fixture'));
  const reloaded = loadTs('lib/encryption.ts');
  assert.equal(await reloaded.decrypt(ciphertext, 'strong-test-passphrase'), 'Private fixture — never production data');
  await assert.rejects(() => reloaded.decrypt(ciphertext, 'wrong-passphrase'));
  const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  bytes[bytes.length - 1] ^= 1;
  await assert.rejects(() => reloaded.decrypt(btoa(String.fromCharCode(...bytes)), 'strong-test-passphrase'));
});

test('legacy checkout cannot initiate payments even without payment configuration', async () => {
  const { POST } = loadTs('app/api/stripe/checkout/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ ...options, body }) } },
  });
  const result = await POST(new Request('https://example.test/api/stripe/checkout', { method: 'POST' }));
  assert.equal(result.status, 410);
  assert.equal(result.body.access, 'free');
});
