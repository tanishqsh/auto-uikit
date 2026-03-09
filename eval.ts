/**
 * eval.ts — DO NOT MODIFY
 * Evaluates all components in components/ directory.
 * Scores each on: compiles, exports, variants, accessibility, simplicity.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildSync } from "esbuild";

interface ComponentScore {
  name: string;
  compiles: number;       // 0-1
  exports: number;        // 0-1
  variants: number;       // 0-3
  accessibility: number;  // 0-3
  simplicity: number;     // 0-3
  total: number;          // 0-11
  lines: number;
}

interface EvalResult {
  components: ComponentScore[];
  componentCount: number;
  totalScore: number;      // sum of all + bonus
  bonus: number;           // component_count * 2
}

async function getComponentFiles(): Promise<string[]> {
  try {
    const files = await readdir("components");
    return files.filter((f) => f.endsWith(".tsx")).sort();
  } catch {
    return [];
  }
}

function checkCompiles(filePath: string): boolean {
  try {
    buildSync({
      entryPoints: [filePath],
      bundle: false,
      write: false,
      jsx: "automatic",
      loader: { ".tsx": "tsx" },
      logLevel: "silent",
    });
    return true;
  } catch {
    return false;
  }
}

function countVariants(content: string): number {
  // Count how many times the main component is rendered in __demo
  const demoMatch = content.match(/export\s+(?:const|function)\s+__demo[\s\S]*?(?:^}|^\);)/m);
  if (!demoMatch) return 0;

  const demoBlock = content.slice(content.indexOf("__demo"));

  // Count component usages in demo (look for JSX self-closing or opening tags)
  const componentName = content.match(/export\s+default\s+(?:function\s+)?(\w+)/)?.[1];
  if (!componentName) return 0;

  const usages = (demoBlock.match(new RegExp(`<${componentName}[\\s/>]`, "g")) || []).length;
  return Math.min(usages, 3);
}

function checkAccessibility(content: string): number {
  let score = 0;
  // aria attributes
  if (/aria-/.test(content)) score++;
  // role attributes
  if (/role=/.test(content)) score++;
  // keyboard handlers or tabIndex or button/a elements
  if (/onKey|tabIndex|<button|<a\s/.test(content)) score++;
  return Math.min(score, 3);
}

function scoreSimplicity(lines: number): number {
  // Fewer lines = better. Under 40 = 3, under 70 = 2, under 100 = 1, 100+ = 0
  if (lines <= 40) return 3;
  if (lines <= 70) return 2;
  if (lines <= 100) return 1;
  return 0;
}

function checkExports(content: string): boolean {
  const hasDefault = /export\s+default/.test(content);
  const hasDemo = /export\s+(?:const|function)\s+__demo/.test(content);
  return hasDefault && hasDemo;
}

async function evaluateComponent(file: string): Promise<ComponentScore> {
  const filePath = join("components", file);
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n").length;
  const name = file.replace(".tsx", "");

  const compiles = checkCompiles(filePath) ? 1 : 0;
  const exports = checkExports(content) ? 1 : 0;
  const variants = countVariants(content);
  const accessibility = checkAccessibility(content);
  const simplicity = scoreSimplicity(lines);

  const total = compiles + exports + variants + accessibility + simplicity;

  return { name, compiles, exports, variants, accessibility, simplicity, total, lines };
}

async function main() {
  const files = await getComponentFiles();

  if (files.length === 0) {
    console.log("No components found in components/");
    console.log("---");
    console.log("component_count: 0");
    console.log("total_score: 0");
    return;
  }

  const scores: ComponentScore[] = [];

  for (const file of files) {
    const score = await evaluateComponent(file);
    scores.push(score);
  }

  // Print individual scores
  console.log("Component Scores:");
  console.log("─".repeat(80));
  console.log(
    "Name".padEnd(20),
    "Comp".padEnd(6),
    "Exp".padEnd(6),
    "Var".padEnd(6),
    "A11y".padEnd(6),
    "Simp".padEnd(6),
    "Total".padEnd(6),
    "Lines"
  );
  console.log("─".repeat(80));

  for (const s of scores) {
    console.log(
      s.name.padEnd(20),
      String(s.compiles).padEnd(6),
      String(s.exports).padEnd(6),
      String(s.variants).padEnd(6),
      String(s.accessibility).padEnd(6),
      String(s.simplicity).padEnd(6),
      String(s.total).padEnd(6),
      String(s.lines)
    );
  }

  const bonus = files.length * 2;
  const totalScore = scores.reduce((sum, s) => sum + s.total, 0) + bonus;

  console.log("─".repeat(80));
  console.log("");
  console.log("---");
  console.log(`component_count: ${files.length}`);
  console.log(`component_bonus: ${bonus}`);
  console.log(`component_score: ${scores.reduce((sum, s) => sum + s.total, 0)}`);
  console.log(`total_score: ${totalScore}`);
}

main().catch(console.error);
