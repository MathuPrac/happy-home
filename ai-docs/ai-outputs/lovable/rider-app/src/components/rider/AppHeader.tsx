import { ChevronLeft, MoreVertical } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function AppHeader({ title, subtitle, back, right, className }: {
  title: string; subtitle?: string; back?: boolean; right?: React.ReactNode; className?: string;
}) {
  const router = useRouter();
  return (
    <header className={cn("sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border", className)}>
      <div className="flex items-center gap-3 px-4 h-14">
        {back && (
          <button onClick={() => router.history.back()} className="h-9 w-9 rounded-full grid place-items-center hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {right ?? (
          <button className="h-9 w-9 rounded-full grid place-items-center hover:bg-muted">
            <MoreVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
