import { Link } from "@tanstack/react-router";
import type { Category } from "@/types";

export function CategoryCard({ category, active }: { category: Category; active?: boolean }) {
  return (
    <Link
      to="/category/$id"
      params={{ id: category.id }}
      className={`flex flex-col items-center gap-2 min-w-[78px] active:scale-95 transition ${
        active ? "" : ""
      }`}
    >
      <div
        className={`grid place-items-center h-16 w-16 rounded-2xl text-2xl transition ${
          active
            ? "bg-accent text-accent-foreground shadow-[var(--shadow-luxe)]"
            : "bg-card border border-border"
        }`}
      >
        {category.emoji}
      </div>
      <span className="text-xs font-medium">{category.name}</span>
    </Link>
  );
}
