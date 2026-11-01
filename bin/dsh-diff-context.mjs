#!/usr/bin/env node
import { gitDiff, renderMarkdown } from '../src/diff.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-diff-context [dir] [--staged] [--json]\\n\\nRead-only compact git diff context.'); process.exit(0) }
const target = args.find((a) => !a.startsWith('--')) || '.'
try {
  const diff = gitDiff(target, { staged: args.includes('--staged') })
  if (args.includes('--json')) console.log(JSON.stringify(diff, null, 2))
  else process.stdout.write(renderMarkdown(diff) + '\n')
} catch (error) { console.error(`dsh-diff-context: ${error.message}`); process.exitCode = 2 }
