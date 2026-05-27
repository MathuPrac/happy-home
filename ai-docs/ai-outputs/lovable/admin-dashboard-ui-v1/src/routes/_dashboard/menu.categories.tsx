import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_dashboard/menu/categories")({
  head: () => ({ meta: [{ title: "Categories — Happy Home Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <DashboardHeader title="Categories" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Menu Categories" subtitle="Organize your menu into cuisines and sections.">
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New category</Button>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-chart-5/15 text-3xl">{c.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.items} items</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
