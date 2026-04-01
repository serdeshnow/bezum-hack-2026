import { spawnSync } from 'node:child_process'

const schemaPath = process.env.SCHEMA_PATH ?? './examples/grass-admin/openapi/docs.json'
const outputPath = process.env.OUTPUT_PATH ?? './src/examples/grass-admin/api/generated'
const fileName = process.env.OUTPUT_NAME ?? 'dto-generated.ts'

const result = spawnSync(
  'npx',
  ['swagger-typescript-api', 'generate', '--path', schemaPath, '-o', outputPath, '-n', fileName, '--no-client'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }
)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
