import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
function Skeleton({ className, ...props }) {
    return (_jsx("div", { className: cn("relative overflow-hidden rounded-md bg-muted/60", "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite]", "before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent", className), ...props }));
}
export { Skeleton };
//# sourceMappingURL=skeleton.js.map