// Asserts that the intentionally-bad fixtures in examples/bad DO trip the governance
// rules. This inverts the usual lint contract: a NON-zero ESLint result here is the
// PASSING case. Run by CI (`pnpm lint:expect-violations`) so the pipeline is green
// precisely because the rules correctly reject raw hex, arbitrary Tailwind, and
// unregistered/invalid props. If a rule silently stops firing, this turns red.
import { ESLint } from 'eslint'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const badDir = path.join(repoRoot, 'examples', 'bad')

// Each fixture must trigger (at least) the rule it is named for.
const EXPECTED = {
  'RawHex.vue': 'registry/no-raw-hex-color',
  'ArbitraryTailwind.vue': 'registry/no-arbitrary-tailwind',
  'UnregisteredProps.vue': 'registry/registry-only-props',
}

async function main() {
  const eslint = new ESLint({
    cwd: badDir,
    // examples/** is deliberately ignored by the root config; use the fixtures' own.
    overrideConfigFile: path.join(badDir, 'eslint.config.js'),
    errorOnUnmatchedPattern: false,
  })

  const results = await eslint.lintFiles([path.join(badDir, '**/*.vue')])
  const byFile = new Map(results.map((r) => [path.basename(r.filePath), r]))

  let ok = true
  const rows = []
  for (const [file, expectedRule] of Object.entries(EXPECTED)) {
    const result = byFile.get(file)
    const rulesFired = new Set((result ? result.messages : []).map((m) => m.ruleId))
    const fired = rulesFired.has(expectedRule)
    if (!fired) ok = false
    rows.push({ file, expectedRule, fired, count: result ? result.messages.length : 0 })
  }

  const totalErrors = results.reduce((n, r) => n + r.errorCount, 0)

  console.log('\nExpected-violations check (examples/bad):\n')
  for (const row of rows) {
    console.log(
      `  ${row.fired ? '✓' : '✗'}  ${row.file.padEnd(22)} ${row.expectedRule.padEnd(34)} (${row.count} message(s))`,
    )
  }
  console.log(`\n  total errors reported: ${totalErrors}`)

  if (!ok || totalErrors === 0) {
    console.error('\n✗ Governance rules did NOT fire as expected on the bad examples.\n')
    process.exit(1)
  }
  console.log('\n✓ All governance rules correctly rejected the bad examples.\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
