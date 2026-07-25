const fs = require('fs')
const path = require('path')

let cached = null

function registryPath() {
  // Prefer resolving through the package export; fall back to the relative path
  // for environments where the workspace symlink isn't resolvable.
  try {
    return require.resolve('@scottmallin/core/registry')
  } catch {
    return path.resolve(__dirname, '../../../packages/core/registry/registry.json')
  }
}

/**
 * Load the registry as a Map<componentName, { props: Map<propName, propDef> }>.
 * Keeping the full prop definitions (not just names) is what lets
 * registry-only-props validate enum `allowedValues`, not only prop existence.
 */
function loadRegistry() {
  if (cached) return cached
  const raw = fs.readFileSync(registryPath(), 'utf-8')
  const { components } = JSON.parse(raw)

  cached = new Map(
    components.map((component) => [
      component.name,
      { props: new Map(component.props.map((prop) => [prop.name, prop])) },
    ]),
  )
  return cached
}

module.exports = { loadRegistry }
