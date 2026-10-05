import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import React from 'react'
import { act, create } from 'react-test-renderer'
import ts from 'typescript'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const require = createRequire(import.meta.url)
const source = ts.transpileModule(readFileSync(new URL('../src/components/TransferModal.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText

test('failed OTP verification preserves the form, shows the error, and permits retry', async () => {
  let attempts = 0
  const exports = {}
  const stubs = {
    '../App': { useAuth: () => ({ userEmail: 'customer@example.com', userId: 'customer', userBalance: 1000, savingsBalance: 0, currency: { symbol: '£', code: 'GBP' }, checkSuspension: () => false }) },
    '../lib/supabase': {
      generateAndSendOTP: async () => true,
      verifyOTP: async () => { attempts++; throw new Error('Network unavailable. Please try again.') },
    },
    '../lib/db': {},
    '../hooks/use-transfer-countries': { useTransferCountries: () => ({ countries: [] }) },
  }
  new Function('require', 'exports', source)((id) => id in stubs ? stubs[id] : require(id), exports)
  let renderer
  const textOf = (node) => typeof node === 'string' ? node : Array.isArray(node) ? node.map(textOf).join('') : node?.props ? textOf(node.props.children) : ''
  const button = (label) => renderer.root.findAllByType('button').find((node) => textOf(node.props.children).includes(label))
  try {
    await act(async () => { renderer = create(React.createElement(exports.default, { onClose: () => assert.fail('Transfer closed') })) })
    const inputs = renderer.root.findAllByType('input')
    const selects = renderer.root.findAllByType('select')
    for (const [node, value] of [[inputs[0], 'Recipient'], [inputs[1], '12345678'], [inputs[2], '25'], [selects[1], 'HSBC'], [selects[2], 'Personal']]) {
      await act(async () => node.props.onChange({ target: { value } }))
    }
    await act(async () => button('Continue').props.onClick())
    await act(async () => button('Request Verification Code').props.onClick())
    // Empty values avoid scheduling focus timers; invoke the handler to simulate
    // a verification request failing independently of the code validation.
    await act(async () => button('Verify & Complete Transfer').props.onClick())
    assert.match(JSON.stringify(renderer.toJSON()), /Network unavailable/)
    assert.equal(button('Verify & Complete Transfer').props.children, 'Verify & Complete Transfer')
    await act(async () => button('Verify & Complete Transfer').props.onClick())
    assert.equal(attempts, 2)
    await act(async () => renderer.root.findAllByType('button')[0].props.onClick())
    assert.match(JSON.stringify(renderer.toJSON()), /Recipient/)
  } finally {
    if (renderer) await act(async () => renderer.unmount())
  }
})
