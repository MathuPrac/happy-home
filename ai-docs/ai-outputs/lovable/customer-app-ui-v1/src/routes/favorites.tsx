import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { TabBar } from "@/components/layout/TabBar";
import { FoodCard } from "@/components/common/FoodCard";
import { useFavorites } from "@/store/favorites";
import { FOODS } from "@/constants/mock-data";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
});

function Favorites() {
  const ids = useFavorites((s) => s.ids);
  const items = FOODS.filter((f) => ids.includes(f.id));

  return (
    <MobileShell withTabBar>
      <header className="px-5 pt-3 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <h1 className="font-display text-2xl font-bold">Saved dishes</h1>
        <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 && "s"} in your collection</p>
      </header>

      <div className="px-5 pt-4 pb-6">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="grid place-items-center mx-auto h-16 w-16 rounded-2xl bg-spice/15 text-spice mb-3">
              <Heart className="h-7 w-7" />
            </div>
            <p className="font-display text-lg font-semibold">No favorites yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-[260px] mx-auto">
              Tap the heart on any dish to save it here for later.
            </p>
            <Link to="/home" className="inline-flex px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
              Browse menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((f) => <FoodCard key={f.id} item={f} />)}
          </div>
        )}
      </div>
      <TabBar />
    </MobileShell>
  );
}
