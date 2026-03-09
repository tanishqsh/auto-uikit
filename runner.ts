/**
 * runner.ts — The autonomous loop (v2).
 * Features: stuck detection, strategy rotation, tournament mode,
 * example injection, auto-expand, browser render testing.
 */

import { readdir, readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { generateScores } from "./preview/scores.js";

const MODEL = "qwen2.5-coder:7b";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const COMPONENTS_DIR = "components";
const RESULTS_FILE = "results.tsv";
const MAX_ITERATIONS = Infinity;
const COOLDOWN_MS = 3000;
const TOURNAMENT_SIZE = 3;
const STUCK_THRESHOLD = 5; // switch strategy after N consecutive failures on same component

// ─── Strategy Rotation ───
type Strategy = "rewrite" | "add-features" | "mimic-best" | "simplify" | "a11y-focus" | "add-animations";
const STRATEGIES: Strategy[] = ["rewrite", "add-features", "mimic-best", "simplify", "a11y-focus", "add-animations"];

// Track consecutive failures per component
const failureTracker: Map<string, { count: number; strategyIdx: number }> = new Map();

// ─── Auto-Expand: extra components to add when average score is high ───
const EXPANSION_COMPONENTS = [
  "Switch", "FileUpload", "ColorPicker", "DatePicker", "Popover",
  "CommandPalette", "NavigationMenu", "Sheet", "ScrollArea", "Collapsible",
  "HoverCard", "AspectRatio", "Separator", "Label", "Menubar",
  "ContextMenu", "AlertDialog", "DataTable", "Calendar", "Combobox",
];

async function getTargetComponents(): Promise<string[]> {
  try {
    const content = await readFile("program.md", "utf-8");
    const listSection = content.match(/## Target Components[\s\S]*?\n([\s\S]*?)(?=\n##|$)/);
    if (!listSection) return [];
    const items = listSection[1].match(/^\d+\.\s+(.+)/gm);
    if (!items) return [];
    return items.map((item) => item.replace(/^\d+\.\s+/, "").split(/\s*[\(–—]/)[0].trim());
  } catch {
    return [];
  }
}

async function queryQwen(prompt: string): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });
  const data = await res.json();
  return data.response || "";
}

async function getExistingComponents(): Promise<string[]> {
  try {
    const files = await readdir(COMPONENTS_DIR);
    return files.filter((f) => f.endsWith(".tsx")).map((f) => f.replace(".tsx", ""));
  } catch {
    return [];
  }
}

interface EvalScores {
  [name: string]: { compiles: number; exports: number; variants: number; accessibility: number; simplicity: number; total: number; lines: number };
}

async function runEval(): Promise<{ totalScore: number; componentCount: number; output: string; scores: EvalScores }> {
  try {
    const output = execSync("npx tsx eval.ts", { encoding: "utf-8", timeout: 30000 });
    const scoreMatch = output.match(/^total_score:\s*(\d+)/m);
    const countMatch = output.match(/^component_count:\s*(\d+)/m);

    // Parse individual component scores (11 columns: name comp exp var a11y simp anim dark intv total lines)
    const scores: EvalScores = {};
    const lines = output.split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 11) {
        const name = parts[0];
        const compiles = parseInt(parts[1]);
        const exports = parseInt(parts[2]);
        const variants = parseInt(parts[3]);
        const accessibility = parseInt(parts[4]);
        const simplicity = parseInt(parts[5]);
        const total = parseInt(parts[9]);
        const lineCount = parseInt(parts[10]);
        if (!isNaN(total) && !isNaN(compiles)) {
          scores[name] = { compiles, exports, variants, accessibility, simplicity, total, lines: lineCount };
        }
      }
    }

    return {
      totalScore: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      componentCount: countMatch ? parseInt(countMatch[1]) : 0,
      output,
      scores,
    };
  } catch (e: any) {
    return { totalScore: 0, componentCount: 0, output: e.message || "eval crashed", scores: {} };
  }
}

function gitCommit(message: string) {
  try {
    execSync(`git add -A && git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: "pipe" });
  } catch {}
}

function gitRevert() {
  try {
    execSync("git checkout -- components/", { stdio: "pipe" });
  } catch {}
}

function getShortHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "0000000";
  }
}

async function logResult(commit: string, totalScore: number, status: string, description: string) {
  const line = `${commit}\t${totalScore}\t${status}\t${description}\n`;
  await appendFile(RESULTS_FILE, line);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fixCommonQwenBugs(code: string): string {
  return code.replace(
    /className=\{(`[^`]*`)\s*\n(\s*)(role=|aria-|onClick|onKey|tabIndex|id=|style=)/g,
    'className={$1}\n$2$3'
  );
}

function extractCodeBlock(response: string): string {
  const match = response.match(/```(?:tsx|jsx|typescript|react)?\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (response.includes("export default")) return response.trim();
  return response.trim();
}

// ─── Browser Render Testing ───
function browserRenderTest(componentName: string): { renders: boolean; errors: string[] } {
  try {
    const filePath = join(COMPONENTS_DIR, `${componentName}.tsx`);
    const code = readFileSync(filePath, "utf-8");
    const issues: string[] = [];

    if (!code.includes("return")) issues.push("no-return");
    if (code.includes("undefined(")) issues.push("undefined-call");

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) issues.push("unbalanced-parens");

    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) issues.push("unbalanced-braces");

    return { renders: issues.length === 0, errors: issues };
  } catch {
    return { renders: true, errors: [] };
  }
}

// ─── Get Top Components for Example Injection ───
async function getTopComponentCode(evalScores: EvalScores, count: number = 2): Promise<string> {
  const sorted = Object.entries(evalScores)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, count);

  let examples = "";
  for (const [name] of sorted) {
    try {
      const code = await readFile(join(COMPONENTS_DIR, `${name}.tsx`), "utf-8");
      examples += `\n// Example of a high-scoring component (${name}, score ${evalScores[name].total}/11):\n\`\`\`tsx\n${code}\n\`\`\`\n`;
    } catch {}
  }
  return examples;
}

// ─── Strategy-Based Prompt Builder ───
async function buildImprovementPrompt(
  targetComponent: string,
  currentCode: string,
  strategy: Strategy,
  evalScores: EvalScores,
): Promise<string> {
  const score = evalScores[targetComponent];
  const hasDemo = /export\s+(?:const|function)\s+__demo/.test(currentCode);

  let strategyInstruction = "";

  switch (strategy) {
    case "rewrite":
      strategyInstruction = `REWRITE this component from scratch. Fresh approach — same functionality but completely new implementation. Keep it clean and under 60 lines.`;
      break;
    case "add-features":
      strategyInstruction = `Add NEW features: hover states, focus rings, disabled state, loading state, or size variants (sm/md/lg). Make it more complete.`;
      break;
    case "mimic-best": {
      const examples = await getTopComponentCode(evalScores);
      strategyInstruction = `Study these high-scoring components and apply their patterns:\n${examples}\nApply the same patterns (prop interfaces, aria, demo style) to improve this component.`;
      break;
    }
    case "simplify":
      strategyInstruction = `SIMPLIFY. Remove unnecessary code. Merge similar variants. Use Tailwind utility classes instead of inline logic. Target under 40 lines while keeping all functionality.`;
      break;
    case "a11y-focus":
      strategyInstruction = `Focus ONLY on accessibility improvements: add aria-label, aria-describedby, role attributes, keyboard event handlers (onKeyDown for Enter/Space), tabIndex, and focus-visible styles.`;
      break;
    case "add-animations":
      strategyInstruction = `Add subtle animations and transitions: hover scale, color transitions, enter/exit animations using Tailwind classes (transition-all, duration-200, hover:scale-105, active:scale-95). Make it feel alive.`;
      break;
  }

  let diagnostics = "";
  if (score) {
    const weak: string[] = [];
    if (score.variants < 3) weak.push(`variants=${score.variants}/3 (show more variants in __demo)`);
    if (score.accessibility < 3) weak.push(`a11y=${score.accessibility}/3 (add aria-*, role, keyboard handlers)`);
    if (score.simplicity < 3) weak.push(`simplicity=${score.simplicity}/3 (${score.lines} lines, reduce to under ${score.simplicity === 0 ? 100 : score.simplicity === 1 ? 70 : 40})`);
    if (!hasDemo) weak.push("MISSING __demo export");
    if (score.exports < 1) weak.push("MISSING proper exports");
    diagnostics = `\nWEAK AREAS: ${weak.join(", ")}\n`;
  }

  return `Improve this React + Tailwind component.

STRATEGY: ${strategyInstruction}
${diagnostics}
Requirements:
- TypeScript .tsx, default export + export const __demo
- __demo must render 3+ variants of the component
- Use aria-*, role attributes, onKeyDown handlers
- Keep under 60 lines if possible
- Tailwind classes: rounded-lg, shadow-sm, transition-all duration-200

Current code:
\`\`\`tsx
${currentCode}
\`\`\`

Return ONLY the complete .tsx file. No explanations.`;
}

// ─── Auto-Expand: add new components when average score is high ───
async function maybeExpandTargets(evalScores: EvalScores): Promise<boolean> {
  const scores = Object.values(evalScores);
  if (scores.length === 0) return false;

  const avgScore = scores.reduce((s, c) => s + c.total, 0) / scores.length;

  // If average component score >= 10 (out of 11), expand
  if (avgScore >= 10) {
    const content = await readFile("program.md", "utf-8");
    const currentTargets = await getTargetComponents();

    // Find components not already in the target list
    const newTargets = EXPANSION_COMPONENTS.filter((c) => !currentTargets.includes(c));
    if (newTargets.length === 0) return false;

    // Add next 5 components
    const toAdd = newTargets.slice(0, 5);
    const nextNumber = currentTargets.length + 1;
    const additions = toAdd.map((c, i) => `${nextNumber + i}. ${c}`).join("\n");

    const updatedContent = content.replace(
      /(## Target Components[\s\S]*?)(\n##|$)/,
      `$1\n${additions}$2`
    );
    await writeFile("program.md", updatedContent);
    console.log(`🌱 AUTO-EXPAND: Added ${toAdd.length} new targets: ${toAdd.join(", ")}`);
    gitCommit(`auto-expand: added ${toAdd.join(", ")} to target list`);
    return true;
  }

  return false;
}

// ─── Tournament: generate N variants, keep best ───
async function tournament(
  targetComponent: string,
  strategy: Strategy,
  evalScores: EvalScores,
  currentScore: number,
): Promise<{ code: string; score: number } | null> {
  const currentCode = await readFile(join(COMPONENTS_DIR, `${targetComponent}.tsx`), "utf-8").catch(() => "");
  const prompt = await buildImprovementPrompt(targetComponent, currentCode, strategy, evalScores);

  const candidates: { code: string; score: number }[] = [];

  for (let t = 0; t < TOURNAMENT_SIZE; t++) {
    console.log(`  🎲 Tournament ${t + 1}/${TOURNAMENT_SIZE}...`);
    const response = await queryQwen(prompt);
    const code = fixCommonQwenBugs(extractCodeBlock(response));

    if (!code || code.length < 20) continue;

    // Write, eval, revert
    const filePath = join(COMPONENTS_DIR, `${targetComponent}.tsx`);
    const backup = currentCode;
    await writeFile(filePath, code);

    const renderCheck = browserRenderTest(targetComponent);
    if (!renderCheck.renders) {
      console.log(`  ❌ Render check failed: ${renderCheck.errors.join(", ")}`);
      await writeFile(filePath, backup);
      continue;
    }

    const result = await runEval();
    await writeFile(filePath, backup); // revert for now

    candidates.push({ code, score: result.totalScore });
    console.log(`  📊 Candidate ${t + 1}: ${result.totalScore} points`);
  }

  if (candidates.length === 0) return null;

  // Pick the best
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (best.score > currentScore) {
    return best;
  }
  return null;
}

async function main() {
  await mkdir(COMPONENTS_DIR, { recursive: true });

  try {
    await readFile(RESULTS_FILE);
  } catch {
    await writeFile(RESULTS_FILE, "commit\ttotal_score\tstatus\tdescription\n");
  }

  console.log("📊 Running baseline eval...");
  const baseline = await runEval();
  console.log(`📊 Baseline: ${baseline.totalScore} points, ${baseline.componentCount} components`);
  let currentScore = baseline.totalScore;
  let totalKept = 0;
  let totalDiscarded = 0;

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🔄 Iteration ${i}/${MAX_ITERATIONS}`);
    console.log(`${"═".repeat(60)}`);

    const existing = await getExistingComponents();
    const targetComponents = await getTargetComponents();
    const missing = targetComponents.filter((c) => !existing.includes(c));

    // Run eval to get per-component scores
    const evalResult = await runEval();
    const evalScores = evalResult.scores;

    // Auto-expand check
    await maybeExpandTargets(evalScores);

    let action: string;
    let targetComponent: string;

    if (missing.length > 0) {
      // ─── ADD MODE ───
      targetComponent = missing[0];
      action = "add";

      const examples = await getTopComponentCode(evalScores, 1);

      const prompt = `Write a React component called "${targetComponent}" using Tailwind CSS.

Requirements:
- TypeScript (.tsx file)
- Default export the component
- Accept props with TypeScript interface (e.g., variant, size, children)
- Support at least 2-3 variants (show via props)
- Add aria attributes for accessibility (aria-label, role, onKeyDown)
- Use Tailwind classes: rounded-lg, shadow-sm, transition-all duration-200
- Colors: blue for primary, slate for neutral, red for danger, green for success
- Also export a named "__demo" component that renders 3+ variants of the component
- Keep under 60 lines

${examples ? `Here's an example of a high-scoring component to follow:\n${examples}` : ""}

Return ONLY the complete .tsx file content. No explanations.`;

      console.log(`🎯 Adding: ${targetComponent}`);
      console.log("🤖 Querying Qwen...");
      const response = await queryQwen(prompt);
      const code = fixCommonQwenBugs(extractCodeBlock(response));

      if (!code || code.length < 20) {
        console.log("❌ Empty response. Skipping.");
        await logResult(getShortHash(), currentScore, "skip", `add ${targetComponent} — empty`);
        continue;
      }

      const filePath = join(COMPONENTS_DIR, `${targetComponent}.tsx`);
      await writeFile(filePath, code);
      console.log(`📝 Wrote ${filePath} (${code.split("\n").length} lines)`);

      const result = await runEval();
      console.log(`📊 Score: ${result.totalScore} (was ${currentScore})`);

      if (result.totalScore >= currentScore) {
        console.log(`✅ KEEP (+${result.totalScore - currentScore})`);
        gitCommit(`add: ${targetComponent} (score ${currentScore} → ${result.totalScore})`);
        await logResult(getShortHash(), result.totalScore, "keep", `add ${targetComponent}`);
        currentScore = result.totalScore;
        totalKept++;
      } else {
        console.log(`❌ DISCARD (score dropped)`);
        gitRevert();
        await logResult(getShortHash(), result.totalScore, "discard", `add ${targetComponent} — reverted`);
        totalDiscarded++;
      }
    } else {
      // ─── IMPROVE MODE (with stuck detection + tournament) ───

      // Find weakest component, but skip ones that are stuck with all strategies exhausted
      const sorted = Object.entries(evalScores).sort(([, a], [, b]) => a.total - b.total);
      targetComponent = sorted[0]?.[0] || existing[0];

      // Check if we're stuck on this component
      const tracker = failureTracker.get(targetComponent) || { count: 0, strategyIdx: 0 };

      if (tracker.count >= STUCK_THRESHOLD) {
        // Rotate strategy
        tracker.strategyIdx = (tracker.strategyIdx + 1) % STRATEGIES.length;
        tracker.count = 0;

        // If we've cycled through all strategies, move to next weakest
        if (tracker.strategyIdx === 0) {
          console.log(`⏭️ Exhausted all strategies on ${targetComponent}. Moving to next.`);
          // Find next weakest that isn't this one
          const next = sorted.find(([name]) => name !== targetComponent);
          if (next) {
            targetComponent = next[0];
          }
          failureTracker.set(targetComponent, { count: 0, strategyIdx: 0 });
        }
      }

      const currentTracker = failureTracker.get(targetComponent) || { count: 0, strategyIdx: 0 };
      const strategy = STRATEGIES[currentTracker.strategyIdx];
      action = `improve[${strategy}]`;

      console.log(`🎯 Improving: ${targetComponent} (strategy: ${strategy}, failures: ${currentTracker.count}/${STUCK_THRESHOLD})`);

      // ─── Tournament Mode ───
      console.log(`🏆 Tournament mode (${TOURNAMENT_SIZE} candidates)...`);
      const winner = await tournament(targetComponent, strategy, evalScores, currentScore);

      if (winner) {
        const filePath = join(COMPONENTS_DIR, `${targetComponent}.tsx`);
        await writeFile(filePath, winner.code);
        console.log(`✅ KEEP (+${winner.score - currentScore}) — tournament winner`);
        gitCommit(`${action}: ${targetComponent} (score ${currentScore} → ${winner.score})`);
        await logResult(getShortHash(), winner.score, "keep", `${action} ${targetComponent}`);
        currentScore = winner.score;
        totalKept++;

        // Reset failure tracker on success
        failureTracker.set(targetComponent, { count: 0, strategyIdx: currentTracker.strategyIdx });
      } else {
        console.log(`❌ DISCARD — no tournament candidate beat ${currentScore}`);
        gitRevert();
        await logResult(getShortHash(), currentScore, "discard", `${action} ${targetComponent} — all candidates failed`);
        totalDiscarded++;

        // Increment failure tracker
        currentTracker.count++;
        failureTracker.set(targetComponent, currentTracker);
      }
    }

    const componentCount = (await getExistingComponents()).length;
    console.log(`📈 Current: ${currentScore} points, ${componentCount} components`);

    // Update scores.json for preview dashboard
    try { await generateScores(); } catch {}

    // Cooldown
    await sleep(COOLDOWN_MS);
  }
}

main().catch(console.error);
