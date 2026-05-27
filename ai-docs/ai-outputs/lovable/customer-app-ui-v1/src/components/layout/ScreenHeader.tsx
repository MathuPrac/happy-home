import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, transparent, onBack }: Props) {
  const router = useRouter();
  return (
    <header
      className={`sticky top-0 z-30 flex items-center gap-3 px-4 py-3 ${
        transparent ? "bg-transparent" : "bg-background/85 backdrop-blur-xl border-b border-border"
      }`}
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
    >
      <button
        onClick={() => (onBack ? onBack() : router.history.back())}
        className="grid place-items-center h-10 w-10 rounded-full bg-card border border-border active:scale-95 transition"
        aria-label="Back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-display text-lg font-semibold truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
