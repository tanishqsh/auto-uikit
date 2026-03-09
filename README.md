# auto-uikit

Autonomous UI kit builder. A local Qwen model creates React + Tailwind components in a loop — eval scores them, keeps the good ones, discards the bad.

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch).

## Quick Start

```bash
# Test Qwen is running
./test-qwen.sh

# Run the autonomous loop
npx tsx runner.ts

# Run eval manually
npx tsx eval.ts
```

## How It Works

```
while true:
  1. Check what components exist
  2. Ask Qwen to add a new one (or improve the weakest)
  3. Write the component to components/
  4. Run eval.ts → score it
  5. If score improved → git commit (keep)
     If score dropped → git revert (discard)
  6. Log to results.tsv
  7. Repeat
```

## Files

| File | Who Edits | Purpose |
|------|-----------|---------|
| `program.md` | Human | Instructions for the agent |
| `eval.ts` | Nobody (locked) | Scores components |
| `runner.ts` | Nobody (locked) | The autonomous loop |
| `components/` | Agent (Qwen) | The UI kit |
| `results.tsv` | Auto-generated | Experiment log |
| `test-qwen.sh` | Nobody | Quick test script |

## Eval Scoring

Each component: 0-11 points
- Compiles (0-1)
- Exports correct (0-1)
- Variants shown in demo (0-3)
- Accessibility (0-3)
- Simplicity / line count (0-3)

Bonus: +2 per component (rewards breadth)

## Requirements

- Node.js 18+
- [Ollama](https://ollama.ai) with `qwen2.5-coder:7b`
- TypeScript (`npm i -D typescript tsx`)
