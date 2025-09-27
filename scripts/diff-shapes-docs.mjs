// Compare experimental ShapeName enum list with docs page content.
import fs from 'node:fs'
import path from 'node:path'

const TYPES_JSON = path.join(process.cwd(), 'docs/cache/miro-websdk/types-index.json')
const DOC_TXT = path.join(
  process.cwd(),
  'docs/cache/miro-help/developers-miro-com-docs-websdk-reference-shape-experimental.txt',
)
const OUT = path.join(process.cwd(), 'docs/cache/miro-help/shape-experimental-report.md')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function extractCodes(text) {
  const set = new Set()
  const re = /flow_chart_[a-z0-9_]+/g
  let m
  while ((m = re.exec(text))) set.add(m[0])
  return Array.from(set).sort()
}

function main() {
  const types = loadJson(TYPES_JSON)
  const shapeNames = Array.isArray(types.shapeName) ? types.shapeName : []
  const docText = fs.existsSync(DOC_TXT) ? fs.readFileSync(DOC_TXT, 'utf8') : ''
  const docCodes = extractCodes(docText)
  const onlyInDocs = docCodes.filter((c) => !shapeNames.includes(c))
  const onlyInTypes = shapeNames.filter((c) => !docCodes.includes(c))
  const lines = [
    '# Shape Experimental Diff',
    '',
    '## Codes found in docs page',
    docCodes.map((c) => `- ${c}`).join('\n') || '(none)',
    '',
    '## Codes in ShapeName enum (types)',
    shapeNames.map((c) => `- ${c}`).join('\n') || '(none)',
    '',
    '## In docs but not in types',
    onlyInDocs.map((c) => `- ${c}`).join('\n') || '(none)',
    '',
    '## In types but not found in docs',
    onlyInTypes.map((c) => `- ${c}`).join('\n') || '(none)',
  ]
  fs.writeFileSync(OUT, lines.join('\n'))
  console.log('Wrote', OUT)
}

main()
