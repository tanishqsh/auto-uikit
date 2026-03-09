# auto-uikit

You are an autonomous UI component researcher. Your job is to build a React + Tailwind UI kit, one component at a time.

## Setup

The project has:
- `components/` — the directory you edit. Each component is a single `.tsx` file.
- `eval.ts` — LOCKED. Evaluates components. Do not modify.
- `results.tsv` — log of every experiment.
- `program.md` — this file. Human edits this. You follow it.

## The Rules

**What you CAN do:**
- Create new `.tsx` files in `components/`
- Edit existing `.tsx` files in `components/`
- Each component must be a default-exported React component using Tailwind CSS

**What you CANNOT do:**
- Edit `eval.ts`
- Install new packages
- Create files outside `components/`

## Component Requirements

Every component must:
1. Be a single `.tsx` file with a default export
2. Use only React + Tailwind CSS (no external UI libraries)
3. Accept reasonable props (typed with TypeScript)
4. Have at least 2 variants (e.g., size, color, style)
5. Be accessible (proper aria labels, keyboard support where needed)
6. Include a `__demo` named export — a component that renders all variants

## The Eval

`eval.ts` checks each component for:
- **Compiles** (0 or 1) — does TypeScript compile without errors?
- **Exports** (0 or 1) — has default export + __demo export?
- **Variants** (0-3) — how many prop variants does __demo show?
- **Accessibility** (0-3) — aria labels, role attributes, keyboard handlers
- **Simplicity** (0-3) — fewer lines = better (penalize bloat)

Score per component: 0-11
Total kit score: sum of all component scores + (component_count * 2 bonus)

## The Loop

1. Check current state: what components exist, what scores low
2. Decide: add a NEW component, or IMPROVE the weakest one
3. Write/edit the component
4. Run eval: `npx tsx eval.ts`
5. If total score improved → `git add . && git commit`
6. If score dropped → `git checkout -- components/`
7. Log result to `results.tsv`
8. Repeat

## Target Components (in priority order)

1. Button (primary, secondary, ghost, sizes)
2. Input (text, with label, error state)
3. Badge (colors, sizes)
4. Card (basic, with header/footer)
5. Alert (info, warning, error, success)
6. Avatar (image, initials, sizes)
7. Toggle / Switch
8. Tooltip
9. Modal / Dialog
10. Tabs
11. Dropdown / Select
12. Progress Bar
13. Skeleton loader
14. Breadcrumbs
15. Accordion

## Style Guide

- Modern, minimal aesthetic
- Color palette: slate/zinc for neutrals, blue for primary, red for danger, green for success, yellow for warning
- Rounded corners (rounded-lg default)
- Subtle shadows (shadow-sm)
- Smooth transitions (transition-all duration-200)
- Font: system font stack (Tailwind default)

## NEVER STOP

Once started, keep going. Add components. Improve weak ones. The human will stop you when they want. If you run out of ideas from the target list, invent new components. A good UI kit has 30+ components.
