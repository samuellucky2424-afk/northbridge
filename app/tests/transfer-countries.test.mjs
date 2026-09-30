import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync(new URL('../src/lib/transfer-countries.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function setup() {
  const records = new Map()
  let listener, failure, denied = false
  const exports = {}
  const firestore = {
    collection: (_db, collection) => collection,
    doc: (_db, collection, id) => `${collection}/${id}`,
    serverTimestamp: () => 'server-time',
    onSnapshot: (_ref, callback, error) => { listener = callback; failure = error; return () => {} },
    runTransaction: async (_db, callback) => {
      if (denied) throw new Error('permission-denied')
      return callback({ get: async (ref) => ({ exists: () => records.has(ref) }), set: (ref, data) => records.set(ref, data) })
    },
  }
  new Function('require', 'exports', source)((id) => id === 'firebase/firestore' ? firestore : { db: {} }, exports)
  return { ...exports, records, deny: () => { denied = true }, emit: () => listener({ docs: [...records.values()].map((data) => ({ data: () => data })) }), fail: (error) => failure(error) }
}

test('a saved country appears in the live customer list alongside all original destinations', async () => {
  const api = setup()
  let countries
  api.subscribeTransferCountries((value) => { countries = value }, assert.fail)
  assert.equal(await api.addTransferCountry('  Rwanda  '), 'Rwanda')
  api.emit()
  assert.ok(countries.includes('Rwanda'))
  assert.ok(api.DEFAULT_TRANSFER_COUNTRIES.every((country) => countries.includes(country)))
  assert.deepEqual(countries, [...countries].sort((a, b) => a.localeCompare(b, 'en')))
  assert.equal(api.records.get('transfer_countries/rwanda').created_at, 'server-time')
})

test('duplicate names, case and whitespace variants cannot add duplicate destinations', async () => {
  const api = setup()
  await assert.rejects(api.addTransferCountry(' united   KINGDOM '), /already/)
  await api.addTransferCountry('Rwanda')
  await assert.rejects(api.addTransferCountry(' RWANDA '), /already/)
  assert.equal(api.records.size, 1)
})

test('accepts international names but rejects blank, numeric, markup and overlong input', async () => {
  const api = setup()
  for (const invalid of ['', '  ', 'A', '123', '<script>', 'a'.repeat(81), '---']) {
    await assert.rejects(api.addTransferCountry(invalid), /country name/)
  }
  await api.addTransferCountry('Côte d’Ivoire')
  await api.addTransferCountry('대한민국')
  assert.equal(api.records.size, 2)
})

test('denied writes and subscription failures are surfaced instead of reporting success', async () => {
  const api = setup()
  api.deny()
  await assert.rejects(api.addTransferCountry('Rwanda'), /permission-denied/)
  assert.equal(api.records.size, 0)
  let error
  api.subscribeTransferCountries(assert.fail, (value) => { error = value })
  api.fail(new Error('offline'))
  assert.equal(error.message, 'offline')
})
