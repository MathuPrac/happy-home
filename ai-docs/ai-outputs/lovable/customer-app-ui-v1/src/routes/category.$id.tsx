import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { FoodCard } from "@/components/common/FoodCard";
import { CATEGORIES, FOODS } from "@/constants/mock-data";
import type { FoodCategory } from "@/types";

export const Route = createFileRoute("/category/$id")({
  component: CategoryListing,
});

function CategoryListing() {
  const { id } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
  const items = FOODS.filter((f) => f.category === (id as FoodCategory));

  return (
    <MobileShell>
      <ScreenHeader title={cat.name} subtitle={`${items.length} dishes available`} />
      <div className="px-5 py-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">Nothing here yet.</p>
        ) : (
          items.map((f) => <FoodCard key={f.id} item={f} variant="wide" />)
        )}
      </div>
    </MobileShell>
  );
}
