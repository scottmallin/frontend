// DTCG (Design Tokens Community Group, 2025.10) ingestion helpers for Style
// Dictionary v5. Handles the parts a raw Figma export uses that plain Style
// Dictionary sources don't: OKLCH colour objects (with hex/string fallbacks),
// dimension objects, and `$extensions.mode` theming.
//
// Kept as pure functions so they can be unit-tested without running a build
// (see tests/dtcg.test.mjs).

const clone = (value) => JSON.parse(JSON.stringify(value))
const round = (n, digits) => (Math.abs(n) < 1e-4 ? 0 : Number(n.toFixed(digits)))

export function isToken(node) {
  return node !== null && typeof node === 'object' && '$value' in node
}

// A mode entry that carries no real value (e.g. `"mode": {}` on a mode-less token
// in a Figma export) should be treated as absent.
export function isEmptyMode(value) {
  return (
    value == null ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      !('hex' in value) &&
      !('value' in value) &&
      !('components' in value) &&
      Object.keys(value).length === 0)
  )
}

export function hasRealMode(token) {
  const mode = token.$extensions?.mode
  return !!mode && Object.values(mode).some((v) => !isEmptyMode(v))
}

// Convert a DTCG colour $value to a CSS colour string. Accepts:
//   - a plain string   ("#eab219", "rgba(0,0,0,.6)")
//   - an OKLCH object   { colorSpace, components:[L,C,H], alpha, hex }
//   - a { hex } object
export function colorToCss(value) {
  if (typeof value === 'string') return value
  if (value && Array.isArray(value.components)) {
    const [l, c, h] = value.components
    const base = `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 3)}`
    return value.alpha != null && value.alpha < 1 ? `${base} / ${value.alpha})` : `${base})`
  }
  if (value && typeof value === 'object' && value.hex) return value.hex
  return String(value)
}

// Convert a DTCG dimension $value ({ value, unit }) to a CSS string; pass strings
// through unchanged.
export function dimensionToCss(value) {
  if (value && typeof value === 'object' && 'value' in value) {
    return `${value.value}${value.unit ?? 'px'}`
  }
  return value
}

// Every mode name declared anywhere in the tree.
export function collectModes(node, set = new Set()) {
  if (node && typeof node === 'object') {
    const mode = node.$extensions?.mode
    if (mode) for (const [name, value] of Object.entries(mode)) if (!isEmptyMode(value)) set.add(name)
    for (const [key, child] of Object.entries(node)) if (!key.startsWith('$')) collectModes(child, set)
  }
  return set
}

// A deep copy of the tree keeping only leaf tokens where keep(token) is true,
// pruning groups that end up empty. Group-level `$type`/`$description` survive.
export function filterTree(node, keep) {
  if (isToken(node)) return keep(node) ? clone(node) : undefined
  if (node && typeof node === 'object') {
    const out = {}
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) {
        out[key] = child
        continue
      }
      const filtered = filterTree(child, keep)
      if (filtered !== undefined) out[key] = filtered
    }
    return Object.keys(out).some((key) => !key.startsWith('$')) ? out : undefined
  }
  return undefined
}

// A deep copy of the tree with each token's `$value` replaced by its value for
// `mode`, falling back to the default `$value` when the token has no such mode.
export function forMode(node, mode) {
  if (isToken(node)) {
    const token = { ...node }
    const modeValue = node.$extensions?.mode?.[mode]
    if (modeValue !== undefined && !isEmptyMode(modeValue)) token.$value = modeValue
    delete token.$extensions
    return token
  }
  if (node && typeof node === 'object') {
    const out = {}
    for (const [key, child] of Object.entries(node)) out[key] = key.startsWith('$') ? child : forMode(child, mode)
    return out
  }
  return node
}

// Register the DTCG value transforms on the Style Dictionary class.
export function registerDtcgTransforms(StyleDictionary) {
  StyleDictionary.registerTransform({
    name: 'dtcg/color',
    type: 'value',
    transitive: true,
    filter: (token) => token.$type === 'color',
    transform: (token) => colorToCss(token.$value),
  })
  StyleDictionary.registerTransform({
    name: 'dtcg/dimension',
    type: 'value',
    transitive: true,
    filter: (token) => token.$type === 'dimension',
    transform: (token) => dimensionToCss(token.$value),
  })
}
