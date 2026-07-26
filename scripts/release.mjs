#!/usr/bin/env node
// Publish all public packages. Thin wrapper around `pnpm -r publish`.
//
// Why a wrapper: pnpm shells out to `npm` for the actual registry upload. Under Volta on
// Windows, pnpm is the standalone @pnpm/exe binary and Volta strips its own directories
// from the child PATH, so `npm` isn't found and publishing dies with `spawnSync npm ENOENT`.
// If `npm` isn't resolvable, we prepend this Node's own directory (which ships npm) to PATH.
// On any normal setup npm is already on PATH, so this is a no-op there and in CI.
import { spawnSync } from 'node:child_process'
import { dirname, delimiter } from 'node:path'

const env = { ...process.env }
const whichCmd = process.platform === 'win32' ? 'where' : 'which'
const npmFound = spawnSync(whichCmd, ['npm'], { stdio: 'ignore' }).status === 0
if (!npmFound) {
  env.PATH = dirname(process.execPath) + delimiter + (env.PATH ?? '')
}

// Extra flags pass through, e.g. `pnpm release -- --dry-run`.
const args = ['-r', 'publish', '--access', 'public', '--no-git-checks', ...process.argv.slice(2)]
const res = spawnSync('pnpm', args, { stdio: 'inherit', env, shell: true })
process.exit(res.status ?? 1)
