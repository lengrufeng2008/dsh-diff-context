# Diff Context for DSH

> Read-only compact git diff context: files, additions/removals, hunks. No model, no network.

## Use

```bash
node bin/dsh-diff-context.mjs . --json
node bin/dsh-diff-context.mjs . --staged
```

In DSH:

```text
Use diff_context on this repository.
```

## Limits

- No untracked files
- No semantic/risk analysis
- No test execution
- Bounded hunk text; not a review approval

## Tests

```bash
npm test
```

## Provenance

A small independent diff reader. License: MIT.
