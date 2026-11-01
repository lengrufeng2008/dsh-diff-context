import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { gitDiff } from '../src/diff.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
async function repo() {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-diff-'))
  execFileSync('git', ['init', '-q'], { cwd: dir })
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir })
  execFileSync('git', ['config', 'user.name', 'test'], { cwd: dir })
  await writeFile(join(dir, 'a.txt'), 'one\ntwo\n')
  execFileSync('git', ['add', 'a.txt'], { cwd: dir })
  execFileSync('git', ['commit', '-qm', 'init'], { cwd: dir })
  await writeFile(join(dir, 'a.txt'), 'one\ntwo\nthree\n')
  return dir
}
test('gitDiff reports files, additions, and hunks', async () => {
  const dir = await repo()
  try {
    const d = gitDiff(dir)
    assert.equal(d.files.length, 1)
    assert.equal(d.added, 1)
    assert.match(d.files[0].hunks[0].header, /^@@/)
  } finally { await rm(dir, { recursive: true, force: true }) }
})
test('plugin registers diff_context and diff-context', async () => {
  const dir = await repo()
  try {
    const tools = []; let factory
    apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
    assert.equal(tools[0].name, 'diff_context')
    const result = await tools[0].execute({ path: dir })
    assert.equal(result.files, 1)
    assert.equal((await factory().list())[0].name, 'diff-context')
  } finally { await rm(dir, { recursive: true, force: true }) }
})
