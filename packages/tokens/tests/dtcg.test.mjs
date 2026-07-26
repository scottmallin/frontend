import test from 'node:test'
import assert from 'node:assert/strict'
import {
  colorToCss,
  dimensionToCss,
  collectModes,
  filterTree,
  forMode,
  hasRealMode,
} from '../lib/dtcg.mjs'

test('colorToCss: string values pass through (hex, rgba)', () => {
  assert.equal(colorToCss('#3B5BDB'), '#3B5BDB')
  assert.equal(colorToCss('rgba(0, 0, 0, 0.6)'), 'rgba(0, 0, 0, 0.6)')
})

test('colorToCss: OKLCH object → oklch()', () => {
  assert.equal(
    colorToCss({ colorSpace: 'oklch', components: [0.7937, 0.1582, 84.937], alpha: 1, hex: '#eab219' }),
    'oklch(0.7937 0.1582 84.937)',
  )
})

test('colorToCss: OKLCH with alpha and near-zero chroma', () => {
  assert.equal(colorToCss({ components: [0.9911, 7.301e-16, 171.25], alpha: 0.4 }), 'oklch(0.9911 0 171.25 / 0.4)')
})

test('colorToCss: { hex } object fallback', () => {
  assert.equal(colorToCss({ hex: '#abcdef' }), '#abcdef')
})

test('dimensionToCss: { value, unit } → CSS string', () => {
  assert.equal(dimensionToCss({ value: 0.75, unit: 'rem' }), '0.75rem')
  assert.equal(dimensionToCss({ value: 9999, unit: 'px' }), '9999px')
})

test('modes: collect, detect, rewrite, and split base vs themed', () => {
  const tree = {
    color: {
      $type: 'color',
      primary: { $value: '#111', $extensions: { mode: { nova: '#111', ember: '#222' } } },
    },
    spacing: {
      $type: 'dimension',
      md: { $value: { value: 1, unit: 'rem' } },
    },
  }

  assert.deepEqual([...collectModes(tree)].sort(), ['ember', 'nova'])
  assert.equal(hasRealMode(tree.color.primary), true)
  assert.equal(hasRealMode(tree.spacing.md), false)

  const ember = forMode(tree, 'ember')
  assert.equal(ember.color.primary.$value, '#222')
  assert.deepEqual(ember.spacing.md.$value, { value: 1, unit: 'rem' }) // untouched

  const themed = filterTree(tree, hasRealMode)
  assert.ok(themed.color?.primary)
  assert.equal(themed.spacing, undefined) // pruned

  const base = filterTree(tree, (token) => !hasRealMode(token))
  assert.ok(base.spacing?.md)
  assert.equal(base.color, undefined) // pruned
})

test('empty mode object ({}) is treated as no mode', () => {
  const token = { $value: '20px', $extensions: { mode: {} } }
  assert.equal(hasRealMode(token), false)
})
