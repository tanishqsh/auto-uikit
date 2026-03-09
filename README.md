# auto-uikit

Autonomous UI kit builder. A local Qwen 2.5 Coder 7B model creates and improves React + Tailwind components in an infinite loop — zero tokens, zero cost, fully offline.

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch).

## How the System Works

### The Loop (v2)

The runner operates in an infinite loop with two modes, smart stuck detection, tournament selection, strategy rotation, and self-expanding scope.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─ Missing components? ─────────────────────────┐  │
│  │                                               │  │
│  │  YES → Add Mode (with example injection)      │  │
│  │  NO  → Improve Mode (tournament + strategy)   │  │
│  └───────────────────────────────────────────────┘  │
│                    ↓                                │
│  ┌─ Auto-expand check ──────────────────────────┐  │
│  │  Avg score ≥ 10/14? → Add 5 new targets      │  │
│  └───────────────────────────────────────────────┘  │
│                    ↓                                │
│           Generate code (Qwen)                      │
│                    ↓                                │
│           Eval + Browser render test                │
│                    ↓                                │
│      Score improved? → Yes → git commit (keep)      │
│                     → No  → git revert (discard)    │
│                    ↓                                │
│           Sleep 3s → repeat                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Mode 1: Add (Breadth)

When target components are missing, the runner creates them. It injects code from the highest-scoring existing component as an example so Qwen learns from its own best work.

### Mode 2: Improve (Depth) — Tournament + Strategy Rotation

Once all targets exist, the runner enters improvement mode with several advanced features:

#### 🏆 Tournament Mode

Instead of generating one attempt, the runner generates **3 candidates** per iteration and keeps only the best one (if it beats the current score). 3x the attempts, same eval cost.

#### 🔄 Strategy Rotation

When stuck on a component (5 consecutive failures), the runner rotates through different improvement strategies:

| # | Strategy | What it does |
|---|----------|-------------|
| 1 | `rewrite` | Throw away current code, start fresh |
| 2 | `add-features` | Add hover states, disabled, loading, sizes |
| 3 | `mimic-best` | Inject top-scoring component code as example |
| 4 | `simplify` | Reduce line count, merge variants |
| 5 | `a11y-focus` | Add aria-*, role, keyboard handlers only |
| 6 | `add-animations` | Add transitions, hover effects, active states |

After exhausting all 6 strategies on one component, it **moves to the next weakest** component automatically.

#### 📊 Diagnostic Prompts

The runner reads per-component eval scores and tells Qwen exactly what's weak:

```
WEAK AREAS: variants=1/3 (show more variants in __demo), a11y=1/3 (add aria-*, role, keyboard handlers)
```

Qwen gets targeted feedback instead of generic "improve this."

#### 🔍 Browser Render Testing

Before eval, each candidate gets a structural render check:
- Has a `return` statement
- Balanced parentheses and braces
- No undefined function calls

Broken code is filtered before it even reaches the eval.

### The Eval (v2)

Each component scored on **8 axes** (0-14 per component):

| Metric | Points | What it checks |
|--------|--------|----------------|
| Compiles | 0-1 | esbuild parses TSX without errors |
| Exports | 0-1 | `export default` + `export const __demo` |
| Variants | 0-3 | Component instances in `__demo` |
| Accessibility | 0-3 | `aria-*`, `role`, keyboard handlers |
| Simplicity | 0-3 | ≤40 lines = 3, ≤70 = 2, ≤100 = 1, 100+ = 0 |
| Animations | 0-1 | `transition-*`, `duration-*`, `hover:scale`, etc. |
| Dark Mode | 0-1 | Uses `dark:` Tailwind variants |
| Interactive | 0-1 | `useState`, `onClick`, `onChange`, etc. |

**Bonus:** +2 per component (rewards breadth)

**Total score** = sum of all component scores + bonus

**Theoretical max** = components × 14 + components × 2

### 🌱 Auto-Expand

When the average component score reaches ≥10/14, the runner automatically adds 5 new components to `program.md`. The kit grows its own scope. Expansion pool: Switch, FileUpload, ColorPicker, DatePicker, Popover, CommandPalette, NavigationMenu, Sheet, ScrollArea, Collapsible, HoverCard, AspectRatio, Separator, Label, Menubar, ContextMenu, AlertDialog, DataTable, Calendar, Combobox.

### 🧬 Example Injection

When adding new components or using the `mimic-best` strategy, the runner injects source code from the highest-scoring components into the prompt. Qwen learns from its own best work — a feedback loop where quality bootstraps quality.

### Git as Experiment History

Every successful iteration = a git commit. Failed experiments are reverted and only exist in `results.tsv`.

```
2009116 improve[a11y-focus]: Tabs (score 310 → 312)
441514a improve[rewrite]: RadioGroup (score 308 → 310)
d8262ee improve[add-features]: Input (score 305 → 308)
c922d8f add: ScrollArea (score 300 → 305)
```

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
# → http://localhost:4200 (also on LAN)
```

## Files

| File | Who Edits | Purpose |
|------|-----------|---------|
| `program.md` | Human | Target list & style guide |
| `eval.ts` | Runner | Scores components (8 axes) |
| `runner.ts` | Runner | The autonomous loop (v2) |
| `components/` | Qwen | The UI kit |
| `results.tsv` | Auto | Full experiment log |
| `runner.log` | Auto | Runtime output |
| `preview/` | Auto | Vite preview + dashboard |

## Zero Cost

Everything runs locally:
- **Model:** Qwen 2.5 Coder 7B via Ollama (~5GB RAM)
- **Eval:** esbuild (fast, no heavy TypeScript compiler)
- **Tournament:** 3 Qwen calls per iteration (still free)
- **Preview:** Vite dev server with hot reload
- **No API tokens. No cloud. No cost.**

## Architecture Decisions

- **Tournament > single attempt:** 3x candidates means 3x chance of breaking plateaus. Free model = unlimited retries.
- **Strategy rotation > random retry:** Doing the same thing 200 times won't work. Six different angles will.
- **Auto-expand > fixed scope:** A static target list creates a ceiling. The system should grow its own ambition.
- **Example injection > blind generation:** Qwen produces better code when shown good examples from the same codebase.
- **Browser render test > code-only eval:** Catches structural bugs that compile fine but would crash at runtime.
- **Diagnostic prompts > generic prompts:** Telling Qwen "your a11y score is 1/3" is better than "improve accessibility."

## Requirements

- macOS / Linux
- Node.js 18+
- [Ollama](https://ollama.ai) with `qwen2.5-coder:7b`
- ~8GB free RAM

## License

MIT
