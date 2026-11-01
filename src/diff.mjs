import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
export function gitDiff(input, { staged = false, maxHunks = 80 } = {}) {
  const root = resolve(input)
  const args = ['-C', root, 'diff', '--unified=3']
  if (staged) args.push('--cached')
  let text
  try { text = execFileSync('git', args, { encoding: 'utf8', timeout: 30_000 }) }
  catch (error) { throw new Error(`git diff failed: ${String(error.stderr || error.message).trim()}`) }
  const files = []
  let current
  let hunk
  for (const line of text.split('\n')) {
    if (line.startsWith('diff --git ')) {
      const m = /^diff --git a\/(.+?) b\/(.+)$/.exec(line)
      current = { path: m ? m[2] : line.slice(11), added: 0, removed: 0, hunks: [] }
      files.push(current); hunk = undefined
    } else if (current && line.startsWith('@@')) {
      hunk = { header: line, lines: [] }; current.hunks.push(hunk)
    } else if (hunk && /^[+-]/.test(line) && !line.startsWith('+++') && !line.startsWith('---')) {
      if (line.startsWith('+')) current.added += 1
      else current.removed += 1
      if (hunk.lines.length < 300) hunk.lines.push(line)
    }
  }
  for (const file of files) file.hunks = file.hunks.slice(0, maxHunks)
  return { root, staged, files, added: files.reduce((n, f) => n + f.added, 0), removed: files.reduce((n, f) => n + f.removed, 0) }
}
export function renderMarkdown(diff) {
  const lines = [`# Diff context: ${diff.files.length} files, +${diff.added}/-${diff.removed}${diff.staged ? ' (staged)' : ''}`, '']
  for (const f of diff.files) {
    lines.push(`## ${f.path}  (+${f.added}/-${f.removed})`, '')
    for (const h of f.hunks) {
      lines.push('```diff', h.header, ...h.lines, '```', '')
    }
  }
  return lines.join('\n')
}
