import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

// __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const bin = path.resolve(__dirname, '../node_modules/.bin/openapi-typescript')
const outPath = path.resolve(__dirname, '../src/frontend/generated/client.ts')
const url = process.env.OPENAPI_URL ?? path.resolve(__dirname, '../openapi.json')
const arguments_ = [url, '--output', outPath]

try {
  await execFileAsync(bin, arguments_)
} catch (error) {
  console.error(error)
  throw error instanceof Error ? error : new Error(String(error))
}
