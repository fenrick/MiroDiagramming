// Fetch selected Miro help/developer pages and cache them for offline diffing.
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'docs/cache/miro-help')

const URLS = [
  // Help Center: flowchart shapes semantics
  'https://help.miro.com/hc/en-us/articles/360017572534',
  'https://help.miro.com/hc/en-us/articles/360017571594',
  // Developer docs (may be dynamic; we still cache responses for reference)
  'https://developers.miro.com/docs/web-sdk-overview',
  'https://developers.miro.com/docs/web-sdk-reference',
  'https://developers.miro.com/docs/web-sdk-reference-widgets',
  'https://developers.miro.com/docs/web-sdk-widgets-shape',
  'https://developers.miro.com/docs/web-sdk-widgets-connector',
  // Explicit experimental shape reference (provided by user)
  'https://developers.miro.com/docs/websdk-reference-shape-experimental',
  // Readme-style reference pages that sometimes 404 via curl but are useful if available
  'https://developers.miro.com/reference/web-sdk-reference-shapes',
  'https://developers.miro.com/reference/reference-web-sdk-shapes',
]

function sanitize(name) {
  return name
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/-$/g, '')
    .toLowerCase()
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    return { status: res.status, text }
  } catch (e) {
    return { status: 0, text: String(e) }
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const index = []
  for (const url of URLS) {
    const { status, text } = await fetchPage(url)
    const slug = sanitize(url.replace(/^https?:\/\//, ''))
    const htmlPath = path.join(OUT_DIR, `${slug}.html`)
    const txtPath = path.join(OUT_DIR, `${slug}.txt`)
    fs.writeFileSync(htmlPath, text)
    fs.writeFileSync(txtPath, stripHtml(text))
    index.push({
      url,
      status,
      html: path.relative(process.cwd(), htmlPath),
      txt: path.relative(process.cwd(), txtPath),
    })
    console.log('Cached', status, url)
  }
  fs.writeFileSync(path.join(OUT_DIR, 'INDEX.json'), JSON.stringify(index, null, 2))
}

main().catch((e) => {
  console.error('cache-miro-help failed', e)
  process.exitCode = 1
})
