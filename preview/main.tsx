import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Auto-import all component demos (lazy — broken files won't crash the app)
const moduleLoaders = import.meta.glob("../components/*.tsx") as Record<
  string,
  () => Promise<{ default: React.ComponentType; __demo?: React.ComponentType }>
>;

interface ComponentScore {
  name: string;
  compiles: number;
  exports: number;
  variants: number;
  accessibility: number;
  simplicity: number;
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

class ErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  render() {
    if (this.state.error) {
      return <p className="text-red-400 text-sm">⚠️ {this.props.name} crashed: {this.state.error}</p>;
    }
    return this.props.children;
  }
}

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-zinc-800 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ScoreChart({ history }: { history: ScoresData["history"] }) {
  if (history.length === 0) return null;

  const maxScore = Math.max(...history.map((h) => h.score), 1);
  const height = 120;
  const width = Math.max(history.length * 8, 300);

  const points = history.map((h, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * (width - 20) + 10;
    const y = height - (h.score / maxScore) * (height - 20) - 10;
    return { x, y, ...h };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px]" style={{ maxHeight: 140 }}>
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={p.status === "keep" ? "#22c55e" : p.status === "discard" ? "#ef4444" : "#6b7280"}
          />
        ))}
        {/* Y axis labels */}
        <text x="2" y="14" fill="#71717a" fontSize="10">
          {maxScore}
        </text>
        <text x="2" y={height - 2} fill="#71717a" fontSize="10">
          0
        </text>
      </svg>
      <div className="flex gap-4 mt-1 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> keep
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> discard
        </span>
      </div>
    </div>
  );
}

function Dashboard({ scores }: { scores: ScoresData }) {
  const pct = Math.round((scores.totalScore / scores.maxPossible) * 100);
  const kept = scores.history.filter((h) => h.status === "keep").length;
  const discarded = scores.history.filter((h) => h.status === "discard").length;

  return (
    <div className="mb-10 space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Score</p>
          <p className="text-2xl font-bold">{scores.totalScore}<span className="text-zinc-600 text-sm font-normal">/{scores.maxPossible}</span></p>
          <ScoreBar value={scores.totalScore} max={scores.maxPossible} color="bg-blue-500" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Components</p>
          <p className="text-2xl font-bold">{scores.componentCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Efficiency</p>
          <p className="text-2xl font-bold">{pct}%</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Experiments</p>
          <p className="text-2xl font-bold text-green-400">{kept} <span className="text-zinc-600 text-sm font-normal">kept</span></p>
          <p className="text-sm text-red-400">{discarded} discarded</p>
        </div>
      </div>

      {/* Score over time */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Score Over Time</p>
        <ScoreChart history={scores.history} />
      </div>

      {/* Component scores table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto">
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Component Scores</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-left">
              <th className="pb-2 font-medium">Component</th>
              <th className="pb-2 font-medium text-center">Comp</th>
              <th className="pb-2 font-medium text-center">Exp</th>
              <th className="pb-2 font-medium text-center">Var</th>
              <th className="pb-2 font-medium text-center">A11y</th>
              <th className="pb-2 font-medium text-center">Simp</th>
              <th className="pb-2 font-medium text-center">Anim</th>
              <th className="pb-2 font-medium text-center">Dark</th>
              <th className="pb-2 font-medium text-center">Intv</th>
              <th className="pb-2 font-medium text-center">Total</th>
              <th className="pb-2 font-medium text-center">Lines</th>
            </tr>
          </thead>
          <tbody>
            {scores.components.map((c) => (
              <tr key={c.name} className="border-t border-zinc-800">
                <td className="py-1.5 font-medium">{c.name}</td>
                <td className={`py-1.5 text-center ${c.compiles ? "text-green-400" : "text-red-400"}`}>{c.compiles}</td>
                <td className={`py-1.5 text-center ${c.exports ? "text-green-400" : "text-red-400"}`}>{c.exports}</td>
                <td className={`py-1.5 text-center ${c.variants === 3 ? "text-green-400" : c.variants > 0 ? "text-yellow-400" : "text-red-400"}`}>{c.variants}/3</td>
                <td className={`py-1.5 text-center ${c.accessibility === 3 ? "text-green-400" : c.accessibility > 0 ? "text-yellow-400" : "text-red-400"}`}>{c.accessibility}/3</td>
                <td className={`py-1.5 text-center ${c.simplicity === 3 ? "text-green-400" : c.simplicity > 0 ? "text-yellow-400" : "text-red-400"}`}>{c.simplicity}/3</td>
                <td className={`py-1.5 text-center ${(c as any).animations ? "text-green-400" : "text-zinc-600"}`}>{(c as any).animations ?? 0}</td>
                <td className={`py-1.5 text-center ${(c as any).darkMode ? "text-green-400" : "text-zinc-600"}`}>{(c as any).darkMode ?? 0}</td>
                <td className={`py-1.5 text-center ${(c as any).interactive ? "text-green-400" : "text-zinc-600"}`}>{(c as any).interactive ?? 0}</td>
                <td className="py-1.5 text-center font-bold">{c.total}/14</td>
                <td className="py-1.5 text-center text-zinc-500">{c.lines}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface LoadedComponent {
  name: string;
  Demo?: React.ComponentType;
  Component?: React.ComponentType;
  error?: string;
}

function App() {
  const [scores, setScores] = useState<ScoresData | null>(null);
  const [tab, setTab] = useState<"dashboard" | "components">("dashboard");
  const [components, setComponents] = useState<LoadedComponent[]>([]);

  useEffect(() => {
    const load = () => {
      fetch("/preview/scores.json?" + Date.now())
        .then((r) => r.json())
        .then(setScores)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadAll() {
      const entries = Object.entries(moduleLoaders);
      const loaded: LoadedComponent[] = [];
      for (const [path, loader] of entries) {
        const name = path.replace("../components/", "").replace(".tsx", "");
        try {
          const mod = await loader();
          loaded.push({ name, Demo: mod.__demo, Component: mod.default });
        } catch (e: any) {
          loaded.push({ name, error: e.message || "Failed to load" });
        }
      }
      loaded.sort((a, b) => a.name.localeCompare(b.name));
      setComponents(loaded);
    }
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">auto-uikit</h1>
        <p className="text-zinc-500 text-sm mb-6">
          {components.length} components — built autonomously by Qwen 2.5 Coder 7B — zero tokens
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("dashboard")}
            className={`px-4 py-1.5 rounded-md text-sm transition-all ${tab === "dashboard" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab("components")}
            className={`px-4 py-1.5 rounded-md text-sm transition-all ${tab === "components" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Components
          </button>
        </div>

        {tab === "dashboard" && scores && <Dashboard scores={scores} />}

        {tab === "components" && (
          <div className="space-y-8">
            {components.map(({ name, Demo, error }) => (
              <div key={name} className="border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-zinc-300">{name}</h2>
                <div className="demo-container flex flex-wrap items-start gap-3 max-h-48 overflow-hidden p-3 bg-zinc-900/50 rounded-lg w-full" style={{ contain: "paint" }}>
                  {error ? (
                    <p className="text-red-400 text-sm">⚠️ Syntax error — will be fixed next iteration</p>
                  ) : Demo ? (
                    <ErrorBoundary name={name}><Demo /></ErrorBoundary>
                  ) : (
                    <p className="text-zinc-600 text-sm">No __demo export yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {components.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-xl">No components yet</p>
            <p className="mt-2">Run <code className="bg-zinc-800 px-2 py-1 rounded">npx tsx runner.ts</code> to start building</p>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
