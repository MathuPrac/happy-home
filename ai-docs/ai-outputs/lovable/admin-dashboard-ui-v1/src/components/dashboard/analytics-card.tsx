import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export interface AnalyticsCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AnalyticsCard({ label, value, delta, hint, icon, className }: AnalyticsCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            </div>
            {icon && (
              <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
            )}
          </div>
          {(delta !== undefined || hint) && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              {delta !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                    positive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(delta)}%
                </span>
              )}
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
