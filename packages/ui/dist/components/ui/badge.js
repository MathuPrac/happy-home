import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-medium tracking-[0.18em] uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground",
            gold: "border-gold/40 bg-gold/10 text-gold",
            outline: "border-border text-foreground/80 bg-transparent",
            secondary: "border-transparent bg-secondary text-secondary-foreground",
            success: "border-transparent bg-success/15 text-success",
            destructive: "border-transparent bg-destructive/15 text-destructive",
            muted: "border-transparent bg-muted text-muted-foreground",
        },
    },
    defaultVariants: { variant: "default" },
});
function Badge({ className, variant, ...props }) {
    return _jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export { Badge, badgeVariants };
//# sourceMappingURL=badge.js.map