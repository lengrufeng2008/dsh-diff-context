---
name: diff-context
description: Read a compact git diff with file stats and hunks. Use diff_context for local review or handoff; read-only, no model, no network.
whenToUse: "A local diff needs a compact review context before commit, handoff, or a focused question."
---

# Diff context

```text
Use diff_context on this repository.
Use diff_context with staged=true for the index.
```

It calls `git diff --unified=3` and returns changed files, added/removed counts, and hunks (bounded).

## Limits

- No untracked files (use `git status` separately).
- No semantic analysis, risk scoring, or test execution.
- Hunk text is capped; extreme diffs are truncated.
- It does not review or approve the change.
