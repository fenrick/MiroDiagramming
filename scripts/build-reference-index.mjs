// Build a consolidated structured index of Web SDK reference docs in cache.
import fs from 'node:fs'
import path from 'node:path'

const HELP_DIR = path.join(process.cwd(), 'docs/cache/miro-help')
const TYPES_JSON = path.join(process.cwd(), 'docs/cache/miro-websdk/types-index.json')
const OUT_JSON = path.join(HELP_DIR, 'reference-index.json')
const OUT_MD = path.join(HELP_DIR, 'reference-index.md')

function safeRead(p) {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return ''
  }
}

function loadTypes() {
  try {
    return JSON.parse(fs.readFileSync(TYPES_JSON, 'utf8'))
  } catch {
    return {}
  }
}

function extractTitle(html) {
  const m = /<title>([^<]+)<\/title>/i.exec(html)
  return m ? m[1].trim() : ''
}

function listFiles() {
  const all = fs.readdirSync(HELP_DIR)
  return all.filter(
    (f) => f.startsWith('developers-miro-com-docs-websdk-reference-') && f.endsWith('.txt'),
  )
}

function mentions(text, list) {
  const lower = text.toLowerCase()
  const found = []
  for (const item of list || []) {
    if (lower.includes(String(item).toLowerCase())) found.push(item)
  }
  return Array.from(new Set(found)).sort()
}

function extractFlowchart(text) {
  const re = /flow_chart_[a-z0-9_]+/g
  const set = new Set()
  let m
  while ((m = re.exec(text))) set.add(m[0])
  return Array.from(set).sort()
}

function build() {
  const types = loadTypes()
  const files = listFiles()
  const pages = []
  for (const txtFile of files) {
    const htmlFile = txtFile.replace(/\.txt$/, '.html')
    const txtPath = path.join(HELP_DIR, txtFile)
    const htmlPath = path.join(HELP_DIR, htmlFile)
    const txt = safeRead(txtPath)
    const html = safeRead(htmlPath)
    const title = extractTitle(html)
    const url =
      'https://' +
      htmlFile
        .replace(/^developers-/, '')
        .replace(/\.html$/, '')
        .replace(/-/g, '/')
        .replace('miro/com/', 'miro.com/')
    pages.push({
      file: txtFile,
      title,
      url,
      mentions: {
        flowChartCodes: extractFlowchart(txt),
        shapeType: mentions(txt, types.shapeType),
        shapeName: mentions(txt, types.shapeName),
        connectorShape: mentions(txt, types.connectorShape),
        strokeStyle: mentions(txt, types.strokeStyle),
        strokeCapShape: mentions(txt, types.strokeCapShape),
        stickyNoteShape: mentions(txt, types.stickyNoteShape),
      },
    })
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
  }
  fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2))
  const lines = [
    '# Web SDK Reference Index',
    '',
    `Pages: ${pages.length}`,
    '',
    ...pages.map((p) => `- ${p.title || p.file} — ${p.url}`),
  ]
  fs.writeFileSync(OUT_MD, lines.join('\n'))
  console.log('Wrote', OUT_JSON)
}

build()
