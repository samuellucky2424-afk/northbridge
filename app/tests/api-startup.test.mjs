import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const configPath = join(projectRoot, 'tsconfig.json')
const config = ts.readConfigFile(configPath, ts.sys.readFile)
assert.equal(config.error, undefined)
const { options, errors } = ts.convertCompilerOptionsFromJson(config.config.compilerOptions, projectRoot)
assert.equal(errors.length, 0)

// Vercel reads the root TypeScript config, not the referenced Vite config.
// Load the emitted file as Node ESM, with the real server dependencies, to
// catch startup errors that mocked endpoint tests and the Vite build miss.
test('admin email function starts using root compiler settings and real Firebase imports', async () => {
  const modulesRoot = resolve(projectRoot, 'node_modules')
  const tempDir = mkdtempSync(join(modulesRoot, '.api-startup-'))
  try {
    // node_modules is a package boundary: explicitly reproduce the app's type.
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ type: packageJson.type }))
    const source = readFileSync(join(projectRoot, 'api/admin-change-email.ts'), 'utf8')
    const emitted = ts.transpileModule(source, { compilerOptions: options }).outputText
    const outputPath = join(tempDir, 'admin-change-email.js')
    writeFileSync(outputPath, emitted)
    const { default: handler } = await import(pathToFileURL(outputPath).href)
    const response = { statusCode: 0, body: null, status(code) { this.statusCode = code; return this }, json(body) { this.body = body } }
    await handler({ method: 'GET', headers: {} }, response)
    assert.equal(response.statusCode, 405)
    assert.equal(response.body.error, 'Method not allowed.')
    await handler({ method: 'POST', headers: {}, body: {} }, response)
    assert.equal(response.statusCode, 401)
  } finally {
    assert.equal(dirname(resolve(tempDir)), modulesRoot)
    assert.ok(resolve(tempDir).startsWith(modulesRoot + sep))
    rmSync(tempDir, { recursive: true, force: true })
  }
})
