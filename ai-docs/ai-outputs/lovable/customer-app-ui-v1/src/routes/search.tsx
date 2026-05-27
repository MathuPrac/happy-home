import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { TabBar } from "@/components/layout/TabBar";
import { FoodCard } from "@/components/common/FoodCard";
import { FOODS, CATEGORIES } from "@/constants/mock-data";

export const Route = createFileRoute("/search")({
  component: SearchScreen,
});

const RECENT = ["Kottu", "Butter Chicken", "Mojito", "Biriyani"];

function SearchScreen() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const results = useMemo(() => {
    return FOODS.filter((f) => {
      const matchQ = !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.description.toLowerCase().includes(q.toLowerCase());
      const matchC = !cat || f.category === cat;
      return matchQ && matchC;
    });
  }, [q, cat]);

  return (
    <MobileShell withTabBar>
      <header className="px-5 pt-3 pb-3 sticky top-0 bg-background/90 backdrop-blur-xl z-20 border-b border-border" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <h1 className="font-display text-2xl font-bold mb-3">Discover</h1>
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center gap-3 h-12 px-4 rounded-2xl bg-card border border-border focus-within:ring-2 focus-within:ring-accent">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes, drinks…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
          </label>
          <button className="grid place-items-center h-12 w-12 rounded-2xl bg-accent text-accent-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          <Pill active={cat === null} onClick={() => setCat(null)}>All</Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              <span>{c.emoji}</span> {c.name}
            </Pill>
          ))}
        </div>

        {!q && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {RECENT.map((r) => (
                <button key={r} onClick={() => setQ(r)} className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6 mb-3">{results.length} dishes</p>
        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-lg font-semibold">No matches</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different category or word.</p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {results.map((f) => (
              <FoodCard key={f.id} item={f} variant="wide" />
            ))}
          </div>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition ${
        active ? "bg-accent text-accent-foreground" : "bg-card border border-border text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
