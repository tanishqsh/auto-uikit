/**
 * eval.ts — Component evaluator (v2).
 * Scores: compiles, exports, variants, accessibility, simplicity + bonus tiers.
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
  animations: number;     // 0-1 (bonus)
  darkMode: number;       // 0-1 (bonus)
  interactive: number;    // 0-1 (bonus)
  total: number;          // 0-14
  lines: number;
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
  const demoMatch = content.match(/export\s+(?:const|function)\s+__demo[\s\S]*?(?:^}|^\);)/m);
  if (!demoMatch) return 0;

  const demoBlock = content.slice(content.indexOf("__demo"));
  const componentName = content.match(/export\s+default\s+(?:function\s+)?(\w+)/)?.[1];
  if (!componentName) return 0;

  const usages = (demoBlock.match(new RegExp(`<${componentName}[\\s/>]`, "g")) || []).length;
  return Math.min(usages, 3);
}

function checkAccessibility(content: string): number {
  let score = 0;
  if (/aria-/.test(content)) score++;
  if (/role=/.test(content)) score++;
  if (/onKey|tabIndex|<button|<a\s/.test(content)) score++;
  return Math.min(score, 3);
}

function scoreSimplicity(lines: number): number {
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

// ─── Bonus tier: animations ───
function checkAnimations(content: string): number {
  const patterns = [
    /transition-/,
    /duration-/,
    /animate-/,
    /hover:scale/,
    /hover:opacity/,
    /active:scale/,
    /transform/,
    /motion/,
  ];
  const hits = patterns.filter((p) => p.test(content)).length;
  return hits >= 2 ? 1 : 0;
}

// ─── Bonus tier: dark mode ───
function checkDarkMode(content: string): number {
  return /dark:/.test(content) ? 1 : 0;
}

// ─── Bonus tier: interactive (state management) ───
function checkInteractive(content: string): number {
  const patterns = [/useState/, /onClick/, /onChange/, /onToggle/, /onClose/, /onSelect/];
  const hits = patterns.filter((p) => p.test(content)).length;
  return hits >= 2 ? 1 : 0;
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
  const animations = checkAnimations(content);
  const darkMode = checkDarkMode(content);
  const interactive = checkInteractive(content);

  const total = compiles + exports + variants + accessibility + simplicity + animations + darkMode + interactive;

  return { name, compiles, exports, variants, accessibility, simplicity, animations, darkMode, interactive, total, lines };
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
    scores.push(await evaluateComponent(file));
  }

  console.log("Component Scores:");
  console.log("─".repeat(100));
  console.log(
    "Name".padEnd(20),
    "Comp".padEnd(6),
    "Exp".padEnd(6),
    "Var".padEnd(6),
    "A11y".padEnd(6),
    "Simp".padEnd(6),
    "Anim".padEnd(6),
    "Dark".padEnd(6),
    "Intv".padEnd(6),
    "Total".padEnd(6),
    "Lines"
  );
  console.log("─".repeat(100));

  for (const s of scores) {
    console.log(
      s.name.padEnd(20),
      String(s.compiles).padEnd(6),
      String(s.exports).padEnd(6),
      String(s.variants).padEnd(6),
      String(s.accessibility).padEnd(6),
      String(s.simplicity).padEnd(6),
      String(s.animations).padEnd(6),
      String(s.darkMode).padEnd(6),
      String(s.interactive).padEnd(6),
      String(s.total).padEnd(6),
      String(s.lines)
    );
  }

  const bonus = files.length * 2;
  const totalScore = scores.reduce((sum, s) => sum + s.total, 0) + bonus;
  const maxPossible = files.length * 14 + bonus;

  console.log("─".repeat(100));
  console.log(`\nMax possible: ${maxPossible} (${files.length} × 14 + ${bonus} bonus)`);
  console.log("");
  console.log("---");
  console.log(`component_count: ${files.length}`);
  console.log(`component_bonus: ${bonus}`);
  console.log(`component_score: ${scores.reduce((sum, s) => sum + s.total, 0)}`);
  console.log(`total_score: ${totalScore}`);
}

main().catch(console.error);
