/**
 * Reads results.tsv and eval output to produce score data for the dashboard (v2).
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { buildSync } from "esbuild";
import { join } from "node:path";

interface ComponentScore {
  name: string;
  compiles: number;
  exports: number;
  variants: number;
  accessibility: number;
  simplicity: number;
  animations: number;
  darkMode: number;
  interactive: number;
  total: number;
  lines: number;
}

interface ScoresData {
  timestamp: string;
  totalScore: number;
  componentCount: number;
  maxPossible: number;
  components: ComponentScore[];
  history: { iteration: number; score: number; status: string; description: string }[];
}

function checkCompiles(filePath: string): boolean {
  try {
    buildSync({ entryPoints: [filePath], bundle: false, write: false, jsx: "automatic", loader: { ".tsx": "tsx" }, logLevel: "silent" });
    return true;
  } catch { return false; }
}

function countVariants(content: string, componentName: string | null): number {
  if (!componentName) return 0;
  const demoBlock = content.slice(content.indexOf("__demo"));
  const usages = (demoBlock.match(new RegExp(`<${componentName}[\\s/>]`, "g")) || []).length;
  return Math.min(usages, 3);
}

function checkAccessibility(content: string): number {
  let s = 0;
  if (/aria-/.test(content)) s++;
  if (/role=/.test(content)) s++;
  if (/onKey|tabIndex|<button|<a\s/.test(content)) s++;
  return Math.min(s, 3);
}

function scoreSimplicity(lines: number): number {
  if (lines <= 40) return 3;
  if (lines <= 70) return 2;
  if (lines <= 100) return 1;
  return 0;
}

function checkAnimations(content: string): number {
  const patterns = [/transition-/, /duration-/, /animate-/, /hover:scale/, /hover:opacity/, /active:scale/, /transform/, /motion/];
  return patterns.filter((p) => p.test(content)).length >= 2 ? 1 : 0;
}

function checkDarkMode(content: string): number {
  return /dark:/.test(content) ? 1 : 0;
}

function checkInteractive(content: string): number {
  const patterns = [/useState/, /onClick/, /onChange/, /onToggle/, /onClose/, /onSelect/];
  return patterns.filter((p) => p.test(content)).length >= 2 ? 1 : 0;
}

export async function generateScores(): Promise<void> {
  const componentsDir = "components";
  let files: string[] = [];
  try {
    files = (await readdir(componentsDir)).filter((f) => f.endsWith(".tsx")).sort();
  } catch {}

  const components: ComponentScore[] = [];

  for (const file of files) {
    const filePath = join(componentsDir, file);
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n").length;
    const name = file.replace(".tsx", "");

    const compiles = checkCompiles(filePath) ? 1 : 0;
    const hasDefault = /export\s+default/.test(content);
    const hasDemo = /export\s+(?:const|function)\s+__demo/.test(content);
    const exports = hasDefault && hasDemo ? 1 : 0;
    const componentName = content.match(/export\s+default\s+(?:function\s+)?(\w+)/)?.[1] || null;
    const variants = hasDemo ? countVariants(content, componentName) : 0;
    const accessibility = checkAccessibility(content);
    const simplicity = scoreSimplicity(lines);
    const animations = checkAnimations(content);
    const darkMode = checkDarkMode(content);
    const interactive = checkInteractive(content);
    const total = compiles + exports + variants + accessibility + simplicity + animations + darkMode + interactive;

    components.push({ name, compiles, exports, variants, accessibility, simplicity, animations, darkMode, interactive, total, lines });
  }

  const history: ScoresData["history"] = [];
  try {
    const tsv = await readFile("results.tsv", "utf-8");
    const lines = tsv.split("\n").slice(1).filter(Boolean);
    lines.forEach((line, i) => {
      const [, score, status, desc] = line.split("\t");
      history.push({ iteration: i + 1, score: parseInt(score) || 0, status: status || "", description: desc || "" });
    });
  } catch {}

  const bonus = components.length * 2;
  const componentScore = components.reduce((s, c) => s + c.total, 0);

  const data: ScoresData = {
    timestamp: new Date().toISOString(),
    totalScore: componentScore + bonus,
    componentCount: components.length,
    maxPossible: components.length * 14 + bonus,
    components,
    history,
  };

  await writeFile("preview/scores.json", JSON.stringify(data, null, 2));
}

generateScores().catch(console.error);
