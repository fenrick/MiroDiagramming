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

function extractEnum(src, name) {
  const startToken = `export enum ${name} {`
  const i = src.indexOf(startToken)
  if (i < 0) return ''
  const rest = src.slice(i + startToken.length)
  const j = rest.indexOf('}')
  if (j < 0) return ''
  return rest.slice(0, j)
}

function extractUnion(src, name) {
  const m = src.match(new RegExp(`export type\\s+${name}\\s*=\\s*([^;]+);`))
  return m ? m[1] : ''
}

function listExperimentalModules(src) {
  const mods = []
  const re = /declare module "@mirohq\/websdk-types\/experimental\/[^"]+"/g
  let m
  while ((m = re.exec(src))) {
    mods.push(m[0].replace('declare module ', '').replace(/"/g, ''))
  }
  return Array.from(new Set(mods)).sort()
}

function writeFileSafe(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content)
}

function main() {
  const outDir = path.join(process.cwd(), 'docs/cache/miro-websdk')
  ensureDir(outDir)
  const src = readTypes()
  writeFileSafe(path.join(outDir, 'websdk-types.index.d.ts'), src)

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
  writeFileSafe(path.join(outDir, 'index-summary.txt'), summary)

  // Shapes and styles cheat-sheets
  const shapeEnum = extractEnum(src, 'ShapeType')
  const shapeNameEnum = extractEnum(src, 'ShapeName')
  const connectorShape = extractUnion(src, 'ConnectorShape')
  const strokeStyle = extractUnion(src, 'StrokeStyle')
  const strokeCap = extractUnion(src, 'StrokeCapShape')
  const stickyShape = extractUnion(src, 'StickyNoteShape')
  const iconShape = extractUnion(src, 'IconShape')

  const shapesMd = `# Miro Shapes

## Stable ShapeType (enum)
${shapeEnum.trim()}

## Experimental ShapeName (enum)
${shapeNameEnum.trim()}
`
  writeFileSafe(path.join(outDir, 'shapes.md'), shapesMd)

  const stylesMd = `# Connector + Style Types

## ConnectorShape (union)
${connectorShape}

## StrokeStyle (union)
${strokeStyle}

## StrokeCapShape (union)
${strokeCap}

## StickyNoteShape (union)
${stickyShape}

## IconShape (union)
${iconShape}
`
  writeFileSafe(path.join(outDir, 'styles.md'), stylesMd)

  // Experimental modules index
  const mods = listExperimentalModules(src)
  writeFileSafe(path.join(outDir, 'experimental-modules.txt'), mods.join('\n'))

  // JSON summary for programmatic use
  function parseEnumValues(enumBody) {
    if (!enumBody) return []
    return enumBody
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const m = l.match(/=\s*"([^"]+)"/)
        return m ? m[1] : undefined
      })
      .filter(Boolean)
  }
  function parseUnionValues(unionStr) {
    if (!unionStr) return []
    return unionStr
      .split('|')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  const typesIndex = {
    shapeType: parseEnumValues(shapeEnum),
    shapeName: parseEnumValues(shapeNameEnum),
    connectorShape: parseUnionValues(connectorShape),
    strokeStyle: parseUnionValues(strokeStyle),
    strokeCapShape: parseUnionValues(strokeCap),
    stickyNoteShape: parseUnionValues(stickyShape),
    iconShape: parseUnionValues(iconShape),
    experimentalModules: mods,
  }
  writeFileSafe(path.join(outDir, 'types-index.json'), JSON.stringify(typesIndex, null, 2))

  // Connector template cheat-sheet from local templates
  try {
    const tplPath = path.join(process.cwd(), 'templates/connectorTemplates.json')
    const raw = fs.readFileSync(tplPath, 'utf8')
    const tpl = JSON.parse(raw)
    const lines = ['# Connector Templates Cheat Sheet', '']
    const mermaidExamples = {
      inheritance: 'Class A <|-- B',
      composition: 'A *-- B',
      aggregation: 'A o-- B',
      dependency: 'A ..> B',
      association: 'A -- B',
    }
    Object.entries(tpl).forEach(([name, def]) => {
      const style = def.style || {}
      const shape = def.shape || ''
      lines.push(
        `- ${name}: shape=${shape} strokeStyle=${style.strokeStyle || ''} startCap=${style.startStrokeCap || ''} endCap=${style.endStrokeCap || ''}`,
      )
      if (mermaidExamples[name]) {
        lines.push(`  - Mermaid: ${mermaidExamples[name]}`)
      }
    })
    writeFileSafe(path.join(outDir, 'cheatsheet.md'), lines.join('\n'))
  } catch {}

  if (!fs.existsSync(path.join(outDir, 'README.md'))) {
    writeFileSafe(
      path.join(outDir, 'README.md'),
      'Local snapshot of @mirohq/websdk-types for planning.\n',
    )
  }
  console.log('Cached Web SDK types to', outDir)
}

main()
