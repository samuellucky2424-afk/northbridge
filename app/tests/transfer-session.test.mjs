import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync(new URL('../src/lib/transfer-session.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function setup({ refreshedEmail = 'new@example.com', errorCode, switchAccount = false } = {}) {
  const calls = []
  const auth = { currentUser: {
    uid: 'customer', email: 'old@example.com',
    async reload() {
      calls.push('reload')
      if (errorCode) throw { code: errorCode }
      this.email = refreshedEmail
    },
    async getIdToken(forceRefresh) {
      assert.equal(forceRefresh, true)
      calls.push('token')
      if (switchAccount) auth.currentUser = { uid: 'other' }
      return 'fresh-token'
    },
  } }
  const exports = {}
  new Function('require', 'exports', source)(() => ({ auth }), exports)
  return { auth, calls, getSession: exports.getTransferSession }
}

test('refreshes a cached old email before requesting OTP after an admin change', async () => {
  const state = setup()
  assert.deepEqual(await state.getSession(' NEW@example.com '), {
    uid: 'customer', email: 'new@example.com', idToken: 'fresh-token',
  })
  assert.deepEqual(state.calls, ['reload', 'token'])
})

test('retains email matching when only the Firestore profile was changed', async () => {
  const state = setup({ refreshedEmail: 'old@example.com' })
  await assert.rejects(state.getSession('new@example.com'), /administrator to complete the email change/)
})

test('rejects signed-out users and missing emails', async () => {
  const state = setup()
  state.auth.currentUser = null
  await assert.rejects(state.getSession('new@example.com'), /sign in again/)
  await assert.rejects(setup({ refreshedEmail: null }).getSession(''), /profile email does not match/)
})

for (const [code, message] of [
  ['auth/user-token-expired', /sign out and sign in again/],
  ['auth/network-request-failed', /internet connection/],
  ['auth/user-disabled', /account is disabled/],
]) {
  test(`explains ${code} without accepting the stale session`, async () => {
    await assert.rejects(setup({ errorCode: code }).getSession('new@example.com'), message)
  })
}

test('rejects a different account signing in during the refresh', async () => {
  await assert.rejects(setup({ switchAccount: true }).getSession('new@example.com'), /signed-in account changed/)
})

test('handles token revocation after user reload', async () => {
  const state = setup()
  state.auth.currentUser.getIdToken = async () => { throw { code: 'auth/user-token-expired' } }
  await assert.rejects(state.getSession('new@example.com'), /sign out and sign in again/)
})
