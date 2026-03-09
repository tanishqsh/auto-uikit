/**
 * runner.ts — The autonomous loop.
 * Calls Qwen via Ollama API, edits components, runs eval, keeps or discards.
 */

import { readdir, readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";

const MODEL = "qwen2.5-coder:7b";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const COMPONENTS_DIR = "components";
const RESULTS_FILE = "results.tsv";
const MAX_ITERATIONS = 100;

// Target components in priority order
const TARGET_COMPONENTS = [
  "Button", "Input", "Badge", "Card", "Alert", "Avatar",
  "Toggle", "Tooltip", "Modal", "Tabs", "Dropdown", "ProgressBar",
  "Skeleton", "Breadcrumbs", "Accordion",
];

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

async function runEval(): Promise<{ totalScore: number; componentCount: number; output: string }> {
  try {
    const output = execSync("npx tsx eval.ts", { encoding: "utf-8", timeout: 30000 });
    const scoreMatch = output.match(/^total_score:\s*(\d+)/m);
    const countMatch = output.match(/^component_count:\s*(\d+)/m);
    return {
      totalScore: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      componentCount: countMatch ? parseInt(countMatch[1]) : 0,
      output,
    };
  } catch (e: any) {
    return { totalScore: 0, componentCount: 0, output: e.message || "eval crashed" };
  }
}

function gitCommit(message: string) {
  try {
    execSync(`git add -A && git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: "pipe" });
  } catch { /* no changes to commit */ }
}

function gitRevert() {
  try {
    execSync("git checkout -- components/", { stdio: "pipe" });
  } catch { /* nothing to revert */ }
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

function extractCodeBlock(response: string): string {
  // Extract code from markdown code blocks
  const match = response.match(/```(?:tsx|jsx|typescript|react)?\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  // If no code block, try to find the code directly
  if (response.includes("export default")) return response.trim();
  return response.trim();
}

async function main() {
  // Ensure components dir exists
  await mkdir(COMPONENTS_DIR, { recursive: true });

  // Init results file if needed
  try {
    await readFile(RESULTS_FILE);
  } catch {
    await writeFile(RESULTS_FILE, "commit\ttotal_score\tstatus\tdescription\n");
  }

  // Get baseline
  console.log("📊 Running baseline eval...");
  const baseline = await runEval();
  console.log(`📊 Baseline: ${baseline.totalScore} points, ${baseline.componentCount} components`);
  let currentScore = baseline.totalScore;

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🔄 Iteration ${i}/${MAX_ITERATIONS}`);
    console.log(`${"═".repeat(60)}`);

    const existing = await getExistingComponents();
    const missing = TARGET_COMPONENTS.filter((c) => !existing.includes(c));

    let action: string;
    let targetComponent: string;
    let prompt: string;

    if (missing.length > 0) {
      // Add a new component
      targetComponent = missing[0];
      action = "add";
      prompt = `Write a React component called "${targetComponent}" using Tailwind CSS.

Requirements:
- TypeScript (.tsx file)
- Default export the component
- Accept props with TypeScript interface (e.g., variant, size, children)
- Support at least 2-3 variants (show via props)
- Add aria attributes for accessibility
- Use Tailwind classes: rounded-lg, shadow-sm, transition-all duration-200
- Colors: blue for primary, slate for neutral, red for danger, green for success
- Also export a named "__demo" component that renders 3+ variants of the component

Return ONLY the complete .tsx file content. No explanations.`;
    } else {
      // Improve weakest component
      // Find lowest scoring
      const evalOutput = await runEval();
      const scoreLines = evalOutput.output.split("\n").filter((l) => l.includes("  "));
      // Just pick a random existing component to improve
      targetComponent = existing[Math.floor(Math.random() * existing.length)];
      action = "improve";

      const currentCode = await readFile(join(COMPONENTS_DIR, `${targetComponent}.tsx`), "utf-8");
      prompt = `Here is a React component. Improve it — add more variants, better accessibility (aria attributes, role, keyboard handlers), or simplify the code. Keep it under 70 lines if possible.

Current code:
\`\`\`tsx
${currentCode}
\`\`\`

Return ONLY the improved complete .tsx file. No explanations.`;
    }

    console.log(`🎯 ${action === "add" ? "Adding" : "Improving"}: ${targetComponent}`);

    // Query Qwen
    console.log("🤖 Querying Qwen...");
    const response = await queryQwen(prompt);
    const code = extractCodeBlock(response);

    if (!code || code.length < 20) {
      console.log("❌ Qwen returned empty/invalid code. Skipping.");
      await logResult(getShortHash(), currentScore, "skip", `${action} ${targetComponent} — empty response`);
      continue;
    }

    // Write component
    const filePath = join(COMPONENTS_DIR, `${targetComponent}.tsx`);
    await writeFile(filePath, code);
    console.log(`📝 Wrote ${filePath} (${code.split("\n").length} lines)`);

    // Eval
    console.log("📊 Running eval...");
    const result = await runEval();
    console.log(`📊 Score: ${result.totalScore} (was ${currentScore})`);

    if (result.totalScore > currentScore) {
      // Keep!
      console.log(`✅ KEEP (+${result.totalScore - currentScore})`);
      gitCommit(`${action}: ${targetComponent} (score ${currentScore} → ${result.totalScore})`);
      await logResult(getShortHash(), result.totalScore, "keep", `${action} ${targetComponent}`);
      currentScore = result.totalScore;
    } else if (result.totalScore === currentScore && action === "add") {
      // New component but same score — keep if it compiles
      console.log("🟡 KEEP (new component, same score)");
      gitCommit(`${action}: ${targetComponent} (score ${result.totalScore})`);
      await logResult(getShortHash(), result.totalScore, "keep", `${action} ${targetComponent} (no gain)`);
      currentScore = result.totalScore;
    } else {
      // Discard
      console.log(`❌ DISCARD (score dropped or no improvement)`);
      gitRevert();
      await logResult(getShortHash(), result.totalScore, "discard", `${action} ${targetComponent} — reverted`);
    }

    console.log(`📈 Current: ${currentScore} points, ${(await getExistingComponents()).length} components`);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`🏁 Done! Final score: ${currentScore}`);
  console.log(`${"═".repeat(60)}`);
}

main().catch(console.error);
