import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Auto-import all component demos
const modules = import.meta.glob("../components/*.tsx", { eager: true }) as Record<
  string,
  { default: React.ComponentType; __demo?: React.ComponentType }
>;

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

function App() {
  const components = Object.entries(modules)
    .map(([path, mod]) => {
      const name = path.replace("../components/", "").replace(".tsx", "");
      return { name, Demo: mod.__demo, Component: mod.default };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">auto-uikit</h1>
        <p className="text-zinc-500 mb-8">
          {components.length} components — built autonomously by Qwen 2.5 Coder 7B
        </p>

        <div className="space-y-8">
          {components.map(({ name, Demo }) => (
            <div key={name} className="border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-zinc-300">{name}</h2>
              <div className="flex flex-wrap items-start gap-3 max-h-64 overflow-auto">
                {Demo ? (
                  <ErrorBoundary name={name}><Demo /></ErrorBoundary>
                ) : (
                  <p className="text-zinc-600 text-sm">No __demo export yet</p>
                )}
              </div>
            </div>
          ))}
        </div>

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
