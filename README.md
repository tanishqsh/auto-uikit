# auto-uikit

Autonomous UI kit builder. A local Qwen 2.5 Coder 7B model creates and improves React + Tailwind components in an infinite loop — zero tokens, zero cost, fully offline.

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch).

## How the System Works

The runner operates in two modes, chosen automatically each iteration:

### Mode 1: Add (Breadth)

When there are components on the target list that don't exist yet, the runner creates them one by one.

```
Missing components? → Yes → Ask Qwen to create the next one
                                ↓
                          Write to components/
                                ↓
                          Run eval → score it
                                ↓
                    Score improved? → Yes → git commit (keep)
                                   → No  → git revert (discard)
```

**Target list (in order):** Button, Input, Badge, Card, Alert, Avatar, Toggle, Tooltip, Modal, Tabs, Dropdown, ProgressBar, Skeleton, Breadcrumbs, Accordion

### Mode 2: Improve (Depth)

Once all target components exist, the runner switches to improvement mode. It **finds the weakest-scoring component** (not random) and asks Qwen to improve it.

```
All targets built? → Yes → Run eval, find lowest-scoring component
                                ↓
                    Read its current code
                                ↓
                    Missing __demo? → Tell Qwen to add it
                    Low accessibility? → Tell Qwen to add aria/role
                    Too many lines? → Tell Qwen to simplify
                                ↓
                    Qwen rewrites the component
                                ↓
                    Run eval → score it
                                ↓
              Score improved? → Yes → git commit (keep)
                             → No  → git revert (discard)
```

### The Eval (Ground Truth)

Each component is scored on 5 axes (0-11 per component):

| Metric | Points | What it checks |
|--------|--------|----------------|
| Compiles | 0-1 | Does esbuild parse the TSX without errors? |
| Exports | 0-1 | Has both `export default` and `export const __demo`? |
| Variants | 0-3 | How many times is the component rendered in `__demo`? |
| Accessibility | 0-3 | `aria-*` attributes, `role`, keyboard handlers |
| Simplicity | 0-3 | Under 40 lines = 3, under 70 = 2, under 100 = 1, 100+ = 0 |

**Bonus:** +2 per component (rewards breadth over depth)

**Total score** = sum of all component scores + bonus

### The Loop

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─ Check: any target components ───┐   │
│  │  missing?                        │   │
│  │                                  │   │
│  │  YES → Mode 1 (Add)             │   │
│  │  NO  → Mode 2 (Improve weakest) │   │
│  └──────────────────────────────────┘   │
│                 ↓                       │
│        Qwen generates code              │
│                 ↓                       │
│        Write to components/             │
│                 ↓                       │
│        Run eval.ts                      │
│                 ↓                       │
│   ┌─ Score improved? ─┐                │
│   │                    │                │
│   │  YES → git commit  │                │
│   │  NO  → git revert  │                │
│   └────────────────────┘                │
│                 ↓                       │
│        Log to results.tsv               │
│                 ↓                       │
│        Sleep 3s (memory cooldown)       │
│                 ↓                       │
│        Hourly report → Telegram         │
│                 ↓                       │
└─────────── repeat forever ──────────────┘
```

### Git as Experiment History

Every successful iteration = a git commit. The git log IS the research log:

```
2009116 improve: Tabs (score 144 → 145)
441514a improve: Skeleton (score 143 → 144)
d8262ee improve: Input (score 141 → 143)
c922d8f add: Accordion (score 129 → 139)
b9d5ee8 add: Breadcrumbs (score 120 → 129)
558f5e3 add: Button (score 0 → 11)
```

Failed experiments are reverted — they only exist in `results.tsv`.

## Quick Start

```bash
# 1. Make sure Ollama is running with Qwen
ollama pull qwen2.5-coder:7b

# 2. Install deps
npm install

# 3. Test Qwen works
./test-qwen.sh

# 4. Run the autonomous loop (infinite)
npx tsx runner.ts

# 5. Preview components (separate terminal)
npx vite
# → http://localhost:4200 (also on LAN via your IP)
```

## Files

| File | Who Edits | Purpose |
|------|-----------|---------|
| `program.md` | Human | Instructions & style guide |
| `eval.ts` | Locked | Scores components (ground truth) |
| `runner.ts` | Locked | The autonomous loop |
| `components/` | Qwen | The UI kit (agent's playground) |
| `results.tsv` | Auto | Full experiment log |
| `runner.log` | Auto | Runtime output |
| `preview/` | Locked | Vite preview server |
| `test-qwen.sh` | Nobody | Quick health check |

## Zero Cost

Everything runs locally:
- **Model:** Qwen 2.5 Coder 7B via Ollama (~5GB RAM)
- **Eval:** esbuild (fast, no heavy TypeScript compiler)
- **Preview:** Vite dev server with hot reload
- **No API tokens. No cloud. No cost.**

## Requirements

- macOS / Linux
- Node.js 18+
- [Ollama](https://ollama.ai) with `qwen2.5-coder:7b`
- ~8GB free RAM

## License

MIT
