// Fetch selected Miro help/developer pages and cache them for offline diffing.
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'docs/cache/miro-help')

// Reference-only crawl, seeded from the SDK reference hub.
const URLS = ['https://developers.miro.com/docs/sdk-reference']

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
  const seen = new Set()
  async function cacheOne(url) {
    if (seen.has(url)) return { status: 0, text: '' }
    seen.add(url)
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
    return { status, text }
  }

  // BFS crawl limited to /docs/ pages that are SDK reference sections.
  const queue = [...URLS]
  let processed = 0
  const limit = 120
  const linkRe = /href=\"(\/docs\/[^\"#?]+)\"/g
  function isReferencePath(p) {
    return (
      p.startsWith('/docs/sdk-reference') ||
      p.includes('reference') ||
      p.startsWith('/docs/websdk-reference')
    )
  }
  while (queue.length && processed < limit) {
    const url = queue.shift()
    const { status, text } = await cacheOne(url)
    processed++
    if (!text || status !== 200) continue
    // Enqueue same-domain /docs/ links that match reference filter
    let m
    while ((m = linkRe.exec(text))) {
      const pathRel = m[1]
      if (!isReferencePath(pathRel)) continue
      const abs = `https://developers.miro.com${pathRel}`
      if (!seen.has(abs)) queue.push(abs)
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'INDEX.json'), JSON.stringify(index, null, 2))
}

main().catch((e) => {
  console.error('cache-miro-help failed', e)
  process.exitCode = 1
})
