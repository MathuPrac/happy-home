import { Minus, Plus } from "lucide-react";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  size?: "sm" | "md" | "lg";
}

export function QuantitySelector({ value, onChange, min = 1, size = "md" }: Props) {
  const sizes = {
    sm: { btn: "h-7 w-7", text: "text-xs w-6" },
    md: { btn: "h-9 w-9", text: "text-sm w-7" },
    lg: { btn: "h-11 w-11", text: "text-base w-9" },
  }[size];

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-card border border-border p-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`grid place-items-center ${sizes.btn} rounded-full bg-secondary text-secondary-foreground active:scale-90 transition`}
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`text-center font-semibold ${sizes.text}`}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className={`grid place-items-center ${sizes.btn} rounded-full bg-accent text-accent-foreground active:scale-90 transition`}
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
