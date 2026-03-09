/**
 * runner.ts — The autonomous loop.
 * Calls Qwen via Ollama API, edits components, runs eval, keeps or discards.
 */

import { readdir, readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { generateScores } from "./preview/scores.js";

const MODEL = "qwen2.5-coder:7b";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const COMPONENTS_DIR = "components";
const RESULTS_FILE = "results.tsv";
const MAX_ITERATIONS = Infinity;
const COOLDOWN_MS = 3000; // 3s between iterations to let memory settle
const REPORT_INTERVAL_MS = 60 * 60 * 1000; // hourly
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

// Target components — read from program.md at startup + every iteration
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

async function sendReport(iteration: number, score: number, componentCount: number, kept: number, discarded: number) {
  const msg = `🤖 *auto-uikit report*
⏱ Iteration: ${iteration}
📦 Components: ${componentCount}
📊 Score: ${score}
✅ Kept: ${kept} | ❌ Discarded: ${discarded}`;

  // Try Telegram
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg, parse_mode: "Markdown" }),
      });
    } catch {}
  }

  // Always log to console
  console.log(`\n📋 HOURLY REPORT\n${msg}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fixCommonQwenBugs(code: string): string {
  // Fix: className={`...`\n      role= → className={`...`}\n      role=
  // Qwen often forgets the closing } after template literal in className
  return code.replace(
    /className=\{(`[^`]*`)\s*\n(\s*)(role=|aria-|onClick|onKey|tabIndex|id=|style=)/g,
    'className={$1}\n$2$3'
  );
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
  let lastReportTime = Date.now();
  let totalKept = 0;
  let totalDiscarded = 0;

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🔄 Iteration ${i}/${MAX_ITERATIONS}`);
    console.log(`${"═".repeat(60)}`);

    const existing = await getExistingComponents();
    const targetComponents = await getTargetComponents();
    const missing = targetComponents.filter((c) => !existing.includes(c));

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
      // Improve weakest component — parse eval output for scores
      const evalOutput = await runEval();
      const lines = evalOutput.output.split("\n");
      let weakest = { name: "", score: Infinity };
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 7 && existing.includes(parts[0])) {
          const total = parseInt(parts[6]);
          if (!isNaN(total) && total < weakest.score) {
            weakest = { name: parts[0], score: total };
          }
        }
      }
      targetComponent = weakest.name || existing[Math.floor(Math.random() * existing.length)];
      action = "improve";

      const currentCode = await readFile(join(COMPONENTS_DIR, `${targetComponent}.tsx`), "utf-8");
      const hasDemo = /export\s+(?:const|function)\s+__demo/.test(currentCode);

      let extraInstruction = "";
      if (!hasDemo) {
        extraInstruction = `\nCRITICAL: This component is MISSING a __demo export. You MUST add: export const __demo = () => (...) that renders 3+ variants of the component.\n`;
      }

      prompt = `Here is a React component. Improve it — add more variants, better accessibility (aria attributes, role, keyboard handlers), or simplify the code. Keep it under 70 lines if possible.
${extraInstruction}
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

    const fixedCode = fixCommonQwenBugs(code);

    if (!fixedCode || fixedCode.length < 20) {
      console.log("❌ Qwen returned empty/invalid code. Skipping.");
      await logResult(getShortHash(), currentScore, "skip", `${action} ${targetComponent} — empty response`);
      continue;
    }

    // Write component
    const filePath = join(COMPONENTS_DIR, `${targetComponent}.tsx`);
    await writeFile(filePath, fixedCode);
    console.log(`📝 Wrote ${filePath} (${code.split("\n").length} lines)`);

    // Eval
    console.log("📊 Running eval...");
    const result = await runEval();
    console.log(`📊 Score: ${result.totalScore} (was ${currentScore})`);

    if (result.totalScore > currentScore) {
      console.log(`✅ KEEP (+${result.totalScore - currentScore})`);
      gitCommit(`${action}: ${targetComponent} (score ${currentScore} → ${result.totalScore})`);
      await logResult(getShortHash(), result.totalScore, "keep", `${action} ${targetComponent}`);
      currentScore = result.totalScore;
      totalKept++;
    } else if (result.totalScore === currentScore && action === "add") {
      console.log("🟡 KEEP (new component, same score)");
      gitCommit(`${action}: ${targetComponent} (score ${result.totalScore})`);
      await logResult(getShortHash(), result.totalScore, "keep", `${action} ${targetComponent} (no gain)`);
      currentScore = result.totalScore;
      totalKept++;
    } else {
      console.log(`❌ DISCARD (score dropped or no improvement)`);
      gitRevert();
      await logResult(getShortHash(), result.totalScore, "discard", `${action} ${targetComponent} — reverted`);
      totalDiscarded++;
    }

    const componentCount = (await getExistingComponents()).length;
    console.log(`📈 Current: ${currentScore} points, ${componentCount} components`);

    // Hourly report
    if (Date.now() - lastReportTime >= REPORT_INTERVAL_MS) {
      await sendReport(i, currentScore, componentCount, totalKept, totalDiscarded);
      lastReportTime = Date.now();
    }

    // Update scores.json for preview dashboard
    try { await generateScores(); } catch {}

    // Cooldown to prevent memory pressure
    await sleep(COOLDOWN_MS);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`🏁 Done! Final score: ${currentScore}`);
  console.log(`${"═".repeat(60)}`);
}

main().catch(console.error);
