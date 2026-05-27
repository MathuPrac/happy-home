import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/mock-data";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/menu/new")({
  head: () => ({ meta: [{ title: "Add Item — Happy Home Admin" }] }),
  component: NewItemPage,
});

function NewItemPage() {
  return (
    <>
      <DashboardHeader title="Add menu item" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Add / Edit Food Item" subtitle="Create a new dish or update an existing one." />

        <form
          className="grid gap-6 lg:grid-cols-3"
          onSubmit={(e) => { e.preventDefault(); toast.success("Item saved as draft"); }}
        >
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Item name</Label>
                  <Input id="name" placeholder="e.g. Chicken Kottu" />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pick category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prep">Prep time (min)</Label>
                  <Input id="prep" type="number" placeholder="18" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" rows={4} placeholder="Shredded godamba roti tossed with chicken, vegetables, and house spices." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (Rs)</Label>
                  <Input id="price" type="number" placeholder="1200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cost">Cost (Rs)</Label>
                  <Input id="cost" type="number" placeholder="480" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax">Tax %</Label>
                  <Input id="tax" type="number" placeholder="8" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Image</CardTitle></CardHeader>
              <CardContent>
                <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:bg-muted/40">
                  <UploadCloud className="h-6 w-6" />
                  Upload image
                  <span className="text-xs">PNG, JPG up to 4MB</span>
                </label>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Available for ordering", def: true },
                  { label: "Mark as popular", def: false },
                  { label: "Available for delivery", def: true },
                  { label: "Available for dine-in", def: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">{s.label}</span>
                    <Switch defaultChecked={s.def} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Save item</Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
