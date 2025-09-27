// Cache a local snapshot of the Miro Web SDK types for planning.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function readTypes() {
  const p = require.resolve('@mirohq/websdk-types/index.d.ts')
  return fs.readFileSync(p, 'utf8')
}

function extract(src, needle, span = 4000) {
  const i = src.indexOf(needle)
  if (i < 0) return ''
  return src.slice(i, i + span)
}

function main() {
  const outDir = path.join(process.cwd(), 'docs/cache/miro-websdk')
  ensureDir(outDir)
  const src = readTypes()
  fs.writeFileSync(path.join(outDir, 'websdk-types.index.d.ts'), src)

  const pieces = {
    Board: extract(src, 'export interface Board'),
    Shape: extract(src, 'export interface Shape'),
    Connector: extract(src, 'export interface Connector'),
    Group: extract(src, 'export interface Group'),
    Frame: extract(src, 'export interface Frame'),
    Text: extract(src, 'export interface Text'),
    StickyNote: extract(src, 'export interface StickyNote'),
    ShapeType: extract(src, 'export type ShapeType'),
    ConnectorStyle: extract(src, 'export interface ConnectorStyle'),
    ShapeStyle: extract(src, 'export interface ShapeStyle'),
  }
  const summary = Object.entries(pieces)
    .filter(([, v]) => v)
    .map(([k, v]) => `### ${k}\n${v}`)
    .join('\n\n')
  fs.writeFileSync(path.join(outDir, 'index-summary.txt'), summary)

  if (!fs.existsSync(path.join(outDir, 'README.md'))) {
    fs.writeFileSync(
      path.join(outDir, 'README.md'),
      'Local snapshot of @mirohq/websdk-types for planning.\n',
    )
  }
  console.log('Cached Web SDK types to', outDir)
}

main()
