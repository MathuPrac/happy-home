import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CATEGORIES, FOODS } from "@/constants/mock-data";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  return (
    <MobileShell>
      <ScreenHeader title="Categories" subtitle={`${CATEGORIES.length} on the menu`} />
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const cover = FOODS.find((f) => f.category === c.id);
          return (
            <Link
              key={c.id}
              to="/category/$id"
              params={{ id: c.id }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-card border border-border group"
            >
              {cover && (
                <img src={cover.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-60 group-active:scale-105 transition" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-3xl">{c.emoji}</p>
                <p className="font-display text-lg font-bold leading-tight mt-1">{c.name}</p>
                <p className="text-[11px] opacity-80">{c.count} dishes</p>
              </div>
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}
