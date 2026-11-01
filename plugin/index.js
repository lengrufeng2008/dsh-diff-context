import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gitDiff, renderMarkdown } from '../src/diff.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'diff-context', 'SKILL.md')
const PROVIDER = 'dsh-diff-context'
export const name = 'diff-context'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'diff-context', description: 'Read-only compact git diff context: files, additions/removals, hunks. No model, no network.', whenToUse: 'A local diff needs a compact review context before commit or handoff.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'diff-context') }, rank: 600, locator: 'diff-context', metadata: { domain: 'git', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'diff_context', description: 'Read a compact git diff for a repository: file stats and hunks. Read-only; no model, no network.', parameters: { type: 'object', additionalProperties: false, properties: { path: { type: 'string' }, staged: { type: 'boolean' } }, required: ['path'] }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, files: { type: 'integer' }, added: { type: 'integer' }, removed: { type: 'integer' } }, required: ['markdown', 'files', 'added', 'removed'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 40_000, async execute(args = {}) { const d = gitDiff(args.path, { staged: args.staged === true }); return { markdown: renderMarkdown(d), files: d.files.length, added: d.added, removed: d.removed } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'diff-context') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
