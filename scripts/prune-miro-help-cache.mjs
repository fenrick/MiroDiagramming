// Remove non-reference cached pages to keep the repo lean.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'docs/cache/miro-help')
const KEEP = [
  /^developers-miro-com-docs-websdk-reference-/,
  /^developers-miro-com-docs-sdk-reference/,
  /^developers-miro-com-docs-web-sdk-reference/,
  /^developers-miro-com-docs-websdk-reference-rate-limiting/,
  /^developers-miro-com-docs-websdk-reference-shape-experimental/,
  /^INDEX\.json$/,
  /^shape-experimental-report\.md$/,
]

function shouldKeep(name) {
  return KEEP.some((re) => re.test(name))
}

function main() {
  if (!fs.existsSync(ROOT)) return
  const files = fs.readdirSync(ROOT)
  let removed = 0
  for (const f of files) {
    if (shouldKeep(f)) continue
    const p = path.join(ROOT, f)
    const stat = fs.statSync(p)
    if (stat.isFile()) {
      fs.unlinkSync(p)
      removed++
      // console.log('Removed', f)
    }
  }
  console.log('Pruned non-reference files:', removed)
}

main()
