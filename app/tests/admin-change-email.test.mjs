import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import ts from 'typescript'

// Execute the actual endpoint with isolated Auth/Firestore doubles. No live
// credentials or account mutations are used by these regression tests.
const source = ts.transpileModule(readFileSync(new URL('../api/admin-change-email.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const oldEmail = 'old@example.com'
const newEmail = 'new@example.com'
const adminEmail = 'okohwiz889@mail.com'

function setup(options = {}) {
  const records = new Map([
    ['profiles_nbb/customer', { email: oldEmail, account_number: '123', balance: 100 }],
    ['account_lookup/123', { uid: 'customer', email: oldEmail }],
    ['account_lookup/legacy', { uid: 'customer', email: oldEmail }],
  ])
  const user = { uid: 'customer', email: oldEmail, emailVerified: true }
  const authWrites = []
  const ref = (path) => ({ path, id: path.split('/').at(-1), get: async () => snap(path) })
  const snap = (path) => ({
    ref: ref(path), id: path.split('/').at(-1), exists: records.has(path),
    data: () => records.get(path), updateTime: 'version',
  })
  const db = {
    collection: (name) => ({
      doc: (id) => ref(`${name}/${id}`),
      where: (_field, _operator, uid) => ({ get: async () => {
        const docs = [...records.keys()].filter((key) => key.startsWith(`${name}/`) && records.get(key).uid === uid).map(snap)
        return { docs, size: docs.length }
      } }),
    }),
    runTransaction: async (callback) => callback({
      get: async (entry) => snap(entry.path),
      set: (entry, data) => records.set(entry.path, data),
      delete: (entry) => records.delete(entry.path),
    }),
    batch: () => {
      const writes = []
      return {
        update: (entry, data) => writes.push([entry.path, data]),
        create: (entry, data) => writes.push([entry.path, data]),
        commit: async () => {
          if (options.batchFails) throw new Error('Firestore unavailable')
          for (const [path, data] of writes) records.set(path, { ...records.get(path), ...data })
        },
      }
    },
  }
  const auth = {
    verifyIdToken: async (_token, checkRevoked) => {
      assert.equal(checkRevoked, true)
      if (options.invalidToken) throw new Error('expired')
      return { uid: 'admin', email: options.nonAdmin ? oldEmail : adminEmail }
    },
    getUser: async (uid) => uid === 'admin'
      ? { uid, email: options.nonAdmin ? oldEmail : adminEmail, disabled: false }
      : { ...user },
    updateUser: async (_uid, updates) => {
      if (options.duplicate) throw Object.assign(new Error('duplicate'), { code: 'auth/email-already-exists' })
      if (options.rollbackFails && authWrites.length) throw new Error('rollback failed')
      authWrites.push(updates)
      Object.assign(user, updates)
    },
  }
  const modules = {
    'node:crypto': { randomUUID },
    'firebase-admin/app': { getApps: () => [{ name: 'admin-email' }] },
    'firebase-admin/auth': { getAuth: () => auth },
    'firebase-admin/firestore': { getFirestore: () => db, FieldValue: { serverTimestamp: () => 'now' } },
  }
  const exports = {}
  new Function('require', 'exports', source)((name) => modules[name], exports)
  return {
    records, user, authWrites, options,
    request: async (overrides = {}) => {
      const response = { statusCode: 0, body: null, status(code) { this.statusCode = code; return this }, json(body) { this.body = body } }
      await exports.default({ method: 'POST', headers: { authorization: 'Bearer token' }, body: { uid: 'customer', email: newEmail, expectedEmail: oldEmail }, ...overrides }, response)
      return response
    },
  }
}

test('changes Auth, profile, and all lookups without changing the balance', async () => {
  const state = setup()
  const result = await state.request({ body: { uid: 'customer', email: ' NEW@example.com ', expectedEmail: oldEmail } })
  assert.equal(result.statusCode, 200)
  assert.equal(state.user.email, newEmail)
  assert.equal(state.user.emailVerified, false)
  assert.equal(state.records.get('profiles_nbb/customer').balance, 100)
  for (const path of ['profiles_nbb/customer', 'account_lookup/123', 'account_lookup/legacy']) assert.equal(state.records.get(path).email, newEmail)
  assert.equal(state.records.has('_admin_email_locks/customer'), false)
})

for (const [name, options, request, status] of [
  ['rejects GET', {}, { method: 'GET' }, 405],
  ['rejects missing token', {}, { headers: {} }, 401],
  ['rejects expired token', { invalidToken: true }, {}, 401],
  ['rejects a non-admin', { nonAdmin: true }, {}, 403],
  ['rejects malformed JSON', {}, { body: '{' }, 400],
  ['rejects an invalid email', {}, { body: { uid: 'customer', email: 'bad', expectedEmail: oldEmail } }, 400],
  ['protects administrator login', {}, { body: { uid: 'admin', email: newEmail, expectedEmail: adminEmail } }, 403],
  ['rejects duplicate email', { duplicate: true }, {}, 409],
  ['rejects stale edits', {}, { body: { uid: 'customer', email: newEmail, expectedEmail: 'stale@example.com' } }, 409],
]) {
  test(name, async () => {
    const state = setup(options)
    assert.equal((await state.request(request)).statusCode, status)
    assert.equal(state.authWrites.length, 0)
    assert.equal(state.records.get('profiles_nbb/customer').email, oldEmail)
  })
}

test('restores Auth when Firestore commit fails', async () => {
  const state = setup({ batchFails: true })
  assert.equal((await state.request()).statusCode, 503)
  assert.equal(state.user.email, oldEmail)
  assert.equal(state.user.emailVerified, true)
  assert.equal(state.authWrites.length, 2)
  assert.equal(state.records.get('account_lookup/123').email, oldEmail)
})

test('reports incomplete recovery and supports retrying the same email', async () => {
  const state = setup({ batchFails: true, rollbackFails: true })
  const result = await state.request()
  assert.match(result.body.error, /login email changed/)
  assert.equal(state.user.email, newEmail)
  state.options.batchFails = false
  assert.equal((await state.request()).statusCode, 200)
  assert.equal(state.records.get('profiles_nbb/customer').email, newEmail)
})

test('rejects concurrent changes before mutating Auth', async () => {
  const state = setup()
  state.records.set('_admin_email_locks/customer', { operationId: 'other', expiresAt: Date.now() + 60_000 })
  assert.equal((await state.request()).statusCode, 409)
  assert.equal(state.authWrites.length, 0)
})

test('repairs a missing lookup and rejects an account owned by another user', async () => {
  const state = setup()
  state.records.delete('account_lookup/123')
  assert.equal((await state.request()).statusCode, 200)
  assert.equal(state.records.get('account_lookup/123').uid, 'customer')
  const conflict = setup()
  conflict.records.set('account_lookup/123', { uid: 'different', email: oldEmail })
  assert.equal((await conflict.request()).statusCode, 409)
  assert.equal(conflict.authWrites.length, 0)
})

test('explicitly repairs an unchanged profile email when Auth still has the old email', async () => {
  const state = setup()
  state.records.get('profiles_nbb/customer').email = newEmail
  const body = { uid: 'customer', email: newEmail, expectedEmail: newEmail }
  assert.equal((await state.request({ body })).statusCode, 409)
  assert.equal(state.authWrites.length, 0)
  assert.equal((await state.request({ body: { ...body, syncLoginEmail: true } })).statusCode, 200)
  assert.equal(state.user.email, newEmail)
  assert.equal(state.records.get('account_lookup/123').email, newEmail)
  assert.equal(state.records.get('account_lookup/legacy').email, newEmail)
  assert.equal(state.records.get('profiles_nbb/customer').balance, 100)
})

test('sync rejects stale profile emails and a different destination', async () => {
  const state = setup()
  const body = { uid: 'customer', email: newEmail, expectedEmail: newEmail, syncLoginEmail: true }
  assert.equal((await state.request({ body })).statusCode, 409)
  assert.equal((await state.request({ body: { ...body, expectedEmail: oldEmail } })).statusCode, 409)
  assert.equal(state.authWrites.length, 0)
})

test('sync still requires administrator access and rejects duplicate emails', async () => {
  const body = { uid: 'customer', email: newEmail, expectedEmail: newEmail, syncLoginEmail: true }
  const denied = setup({ nonAdmin: true })
  assert.equal((await denied.request({ body })).statusCode, 403)
  const duplicate = setup({ duplicate: true })
  duplicate.records.get('profiles_nbb/customer').email = newEmail
  assert.equal((await duplicate.request({ body })).statusCode, 409)
  assert.equal(duplicate.user.email, oldEmail)
})

test('sync restores the actual previous Auth email if lookup writes fail', async () => {
  const state = setup({ batchFails: true })
  state.records.get('profiles_nbb/customer').email = newEmail
  assert.equal((await state.request({ body: {
    uid: 'customer', email: newEmail, expectedEmail: newEmail, syncLoginEmail: true,
  } })).statusCode, 503)
  assert.equal(state.user.email, oldEmail)
  assert.equal(state.records.get('account_lookup/123').email, oldEmail)
})
