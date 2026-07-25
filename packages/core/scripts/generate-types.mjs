// Generate TypeScript prop types from the component registry.
//
// This is what makes registry.json a *single source of truth* rather than just a
// lint oracle: the same JSON that the ESLint rules enforce at author-time also
// produces the compile-time prop interfaces the Vue package builds against. Drift
// between "what is registered" and "what TypeScript accepts" becomes structurally
// impossible — change the registry, the types (and the lint contract) move together.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const REGISTRY = path.join(root, 'registry/registry.json')
const OUT = path.join(root, 'src/generated/registry-types.ts')

/** Map a registry prop to a TypeScript type expression. */
function tsType(prop) {
  switch (prop.type) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'enum':
      if (!Array.isArray(prop.allowedValues) || prop.allowedValues.length === 0) {
        throw new Error(`Enum prop "${prop.name}" is missing allowedValues in the registry.`)
      }
      return prop.allowedValues.map((v) => `'${v}'`).join(' | ')
    case 'slot-content':
      return 'unknown'
    default:
      throw new Error(`Unknown prop type "${prop.type}" for prop "${prop.name}".`)
  }
}

function docblock(prop) {
  const lines = []
  if (prop.description) lines.push(prop.description)
  if (prop.default !== undefined) lines.push(`@default ${JSON.stringify(prop.default)}`)
  if (lines.length === 0) return ''
  if (lines.length === 1) return `  /** ${lines[0]} */\n`
  return `  /**\n${lines.map((l) => `   * ${l}`).join('\n')}\n   */\n`
}

function componentInterface(component) {
  const body = component.props
    .map((prop) => {
      const optional = prop.required ? '' : '?'
      return `${docblock(prop)}  ${prop.name}${optional}: ${tsType(prop)}`
    })
    .join('\n')
  const desc = component.description ? `/** ${component.description} */\n` : ''
  return `${desc}export interface ${component.name}Props {\n${body}\n}`
}

async function run() {
  const raw = await fs.readFile(REGISTRY, 'utf8')
  const { components } = JSON.parse(raw)

  const interfaces = components.map(componentInterface).join('\n\n')
  const names = components.map((c) => `'${c.name}'`).join(', ')

  const output = `// AUTO-GENERATED from packages/core/registry/registry.json — do not edit by hand.
// Regenerate: \`pnpm --filter @scottmallin/core build\` (runs scripts/generate-types.mjs).

${interfaces}

/** Every component name declared in the registry. */
export const registryComponentNames = [${names}] as const

export type RegistryComponentName = (typeof registryComponentNames)[number]
`

  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, output, 'utf8')
  console.log(`✓ generated ${path.relative(root, OUT)} for ${components.length} components`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
