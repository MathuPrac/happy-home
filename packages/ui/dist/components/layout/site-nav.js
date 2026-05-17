import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
const links = [
    { label: "Menu", to: "/" },
    { label: "Story", to: "/" },
    { label: "Private Dining", to: "/" },
    { label: "Journal", to: "/" },
    { label: "Contact", to: "/" },
];
export function SiteNav() {
    const [open, setOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (_jsxs("header", { className: cn("fixed inset-x-0 top-0 z-40 transition-all duration-500", scrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
            : "border-b border-transparent"), children: [_jsxs("nav", { "aria-label": "Primary", className: "mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10", children: [_jsxs(Link, { to: "/", className: "group flex items-center gap-3", "aria-label": "Happy Home Restaurant home", children: [_jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-[0.65rem] font-medium tracking-[0.2em] text-gold transition-colors group-hover:bg-gold/10", children: "HH" }), _jsxs("span", { className: "font-display text-xl tracking-wide", children: ["Happy ", _jsx("span", { className: "text-gold", children: "Home" })] })] }), _jsx("ul", { className: "hidden items-center gap-10 md:flex", role: "list", children: links.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.to, className: "text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-gold", children: link.label }) }, link.label))) }), _jsx("div", { className: "hidden md:block", children: _jsx(Button, { variant: "gold", size: "sm", children: "Reserve" }) }), _jsx("button", { type: "button", "aria-label": open ? "Close menu" : "Open menu", "aria-expanded": open, onClick: () => setOpen((v) => !v), className: "grid h-10 w-10 place-items-center rounded-md border border-border text-foreground md:hidden", children: open ? _jsx(X, { className: "h-4 w-4" }) : _jsx(Menu, { className: "h-4 w-4" }) })] }), open && (_jsx("div", { className: "border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden", children: _jsxs("ul", { className: "space-y-1 px-6 py-6", role: "list", children: [links.map((link) => (_jsx("li", { children: _jsx(Link, { to: link.to, onClick: () => setOpen(false), className: "block py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-gold", children: link.label }) }, link.label))), _jsx("li", { className: "pt-3", children: _jsx(Button, { variant: "gold", size: "sm", className: "w-full", children: "Reserve" }) })] }) }))] }));
}
//# sourceMappingURL=site-nav.js.map