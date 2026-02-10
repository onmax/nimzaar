import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

// Workaround: `node_modules/@nuxthub/blob/blob.mjs` sometimes ends up with trailing garbage,
// which breaks Nitro/Rollup parsing during `nuxt build`.
// We overwrite it with the expected Cloudflare R2 driver shim.
const file = 'node_modules/@nuxthub/blob/blob.mjs'

mkdirSync(dirname(file), { recursive: true })

writeFileSync(
  file,
  [
    'import { createBlobStorage } from "@nuxthub/core/blob";',
    'import { createDriver } from "@nuxthub/core/blob/drivers/cloudflare-r2";',
    '',
    'export { ensureBlob } from "@nuxthub/core/blob";',
    'export const blob = createBlobStorage(createDriver({"binding":"BLOB"}));',
    '',
  ].join('\n'),
  'utf8',
)

