import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { feedback } from "@/lib/mock-data";
import { Star } from "lucide-react";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";

export const Route = createFileRoute("/_dashboard/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Happy Home Admin" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <>
      <DashboardHeader title="Customer Feedback" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Customer Feedback" subtitle="What your guests are saying." />

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard label="Avg rating" value="4.7 / 5" delta={0.2} icon={<Star className="h-4 w-4" />} />
          <AnalyticsCard label="Reviews this week" value="142" delta={11.4} />
          <AnalyticsCard label="Response rate" value="94%" delta={3.1} hint="staff replies" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {feedback.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{f.customer}</div>
                    <div className="text-xs text-muted-foreground">Order #{f.order} · {f.time}</div>
                  </div>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={i < f.rating ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4 text-muted-foreground/30"} />
                  ))}</div>
                </div>
                <p className="mt-3 text-sm text-foreground/90">"{f.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
