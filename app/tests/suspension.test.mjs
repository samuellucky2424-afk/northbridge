import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import React from 'react'
import { create, act } from 'react-test-renderer'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import ts from 'typescript'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const require = createRequire(import.meta.url)
const source = ts.transpileModule(readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText

async function setup(path = '/') {
  const user = { uid: 'customer-1', email: 'customer@example.com' }
  const profile = { uid: user.uid, email: user.email, role: 'customer', status: 'suspended', accountNumber: '123', country: 'United Kingdom' }
  const auth = { currentUser: null }
  let authChanged, profileChanged, value, navigate, renderer
  const exports = {}
  const stubs = {
    './lib/firebase': { db: {} },
    './lib/auth': {
      auth, ADMIN_EMAIL: 'admin@example.com',
      getUserProfile: async () => profile,
      mapProfileFromDoc: (_id, data) => data,
      signIn: async (_email, password) => {
        if (password === 'wrong') throw { code: 'auth/invalid-credential' }
        auth.currentUser = user
        authChanged(user)
        profileChanged({ exists: () => true, id: user.uid, data: () => profile })
        return user
      },
      getCurrency: () => ({ code: 'GBP', symbol: '£' }),
      fullName: () => 'Customer', toNumber: (n) => Number(n || 0),
    },
    './lib/db': { getEmailByAccountNumber: async () => user.email },
    'firebase/auth': {
      onAuthStateChanged: (_auth, callback) => { authChanged = callback; return () => {} },
      signOut: async () => { auth.currentUser = null; authChanged(null) },
    },
    'firebase/firestore': {
      doc: () => ({}),
      onSnapshot: (_ref, callback) => { profileChanged = callback; return () => {} },
    },
  }
  new Function('require', 'exports', source)((id) => {
    if (id in stubs) return stubs[id]
    if (id.startsWith('./pages/')) return { default: () => null }
    return require(id)
  }, exports)
  function Probe() { value = exports.useAuth(); navigate = useNavigate(); return null }
  await act(async () => {
    renderer = create(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(exports.AuthProvider, null, React.createElement(Probe))))
  })
  return {
    get value() { return value },
    modal: () => JSON.stringify(renderer.toJSON()).includes('Account Status Restricted'),
    restore: async () => act(async () => {
      auth.currentUser = user
      authChanged(user)
      profileChanged({ exists: () => true, id: user.uid, data: () => profile })
    }),
    go: async (path) => act(async () => navigate(path)),
    switchAccount: async () => act(async () => {
      const other = { uid: 'customer-2', email: 'other@example.com' }
      auth.currentUser = other
      authChanged(other)
      profileChanged({ exists: () => true, id: other.uid, data: () => ({ ...profile, uid: other.uid, email: other.email }) })
    }),
    status: async (status) => act(async () => {
      profile.status = status
      profileChanged({ exists: () => true, id: user.uid, data: () => ({ ...profile }) })
    }),
    login: async (password = 'correct') => {
      let result
      await act(async () => { result = await value.login(user.email, password) })
      return result
    },
    close: async () => act(async () => renderer.unmount()),
    dismiss: async () => act(async () => renderer.root.findByType('button').props.onClick()),
  }
}

test('restoring a suspended session never opens the warning on the homepage', async () => {
  const app = await setup()
  try {
    await app.restore()
    assert.equal(app.value.authLoading, false)
    assert.equal(app.value.isAuthenticated, true)
    assert.equal(app.modal(), false)
    await app.status('active')
    await app.status('suspended')
    assert.equal(app.modal(), false)
  } finally { await app.close() }
})

test('successful suspended login warns on dashboard; home, logout and next visit stay clear', async () => {
  const app = await setup('/login')
  try {
    assert.equal((await app.login()).success, true)
    assert.equal(app.modal(), false)
    await app.go('/dashboard')
    assert.equal(app.modal(), true)
    await app.dismiss()
    assert.equal(app.modal(), false)
    let blocked
    await act(async () => { blocked = app.value.checkSuspension() })
    assert.equal(blocked, true)
    assert.equal(app.modal(), true)
    await app.go('/')
    assert.equal(app.modal(), false)
    await act(async () => app.value.logout())
    assert.equal(app.value.isAuthenticated, false)
    assert.equal(app.modal(), false)
    await app.restore()
    assert.equal(app.modal(), false)
  } finally { await app.close() }
})

test('failed login cannot arm a warning for a restored account', async () => {
  const app = await setup('/login')
  try {
    await app.restore()
    assert.equal((await app.login('wrong')).success, false)
    await app.go('/dashboard')
    assert.equal(app.modal(), false)
    await act(async () => assert.equal(app.value.checkSuspension(), true))
    assert.equal(app.modal(), true)
    await app.status('active')
    assert.equal(app.modal(), false)
  } finally { await app.close() }
})

test('a suspended account restored directly on dashboard is still blocked from transfers', async () => {
  const app = await setup('/dashboard')
  try {
    await app.restore()
    assert.equal(app.modal(), false)
    await act(async () => assert.equal(app.value.checkSuspension(), true))
    assert.equal(app.modal(), true)
  } finally { await app.close() }
})

test('a warning from one account cannot leak into another restored account', async () => {
  const app = await setup('/login')
  try {
    await app.login()
    await app.go('/dashboard')
    assert.equal(app.modal(), true)
    await app.switchAccount()
    assert.equal(app.value.userId, 'customer-2')
    assert.equal(app.modal(), false)
  } finally { await app.close() }
})
