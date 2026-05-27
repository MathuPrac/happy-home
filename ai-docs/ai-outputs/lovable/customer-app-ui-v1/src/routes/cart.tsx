import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingBag, Tag } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { useCart, cartSelectors } from "@/store/cart";
import { FOODS } from "@/constants/mock-data";
import { formatLKR } from "@/utils/format";

export const Route = createFileRoute("/cart")({
  component: Cart,
});

function Cart() {
  const nav = useNavigate();
  const { lines, setQty, remove } = useCart();
  const subtotal = cartSelectors.subtotal(lines);
  const delivery = lines.length ? 250 : 0;
  const discount = subtotal >= 2000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + delivery - discount;

  return (
    <MobileShell>
      <ScreenHeader title="Your cart" subtitle={`${lines.length} item${lines.length !== 1 ? "s" : ""}`} />

      {lines.length === 0 ? (
        <div className="px-5 py-20 text-center">
          <div className="grid place-items-center mx-auto h-16 w-16 rounded-2xl bg-secondary mb-4">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-display text-lg font-semibold">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Add a dish to get started.</p>
          <Link to="/home" className="inline-flex px-6 py-3 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <div className="px-5 py-4 space-y-3 pb-44">
            {lines.map((l) => {
              const f = FOODS.find((x) => x.id === l.foodId);
              if (!f) return null;
              return (
                <div key={l.foodId} className="flex gap-3 p-3 rounded-2xl bg-card border border-border">
                  <img src={f.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{f.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-bold text-accent">{formatLKR(f.price * l.qty)}</span>
                      <QuantitySelector value={l.qty} onChange={(n) => setQty(l.foodId, n)} size="sm" min={0} />
                    </div>
                  </div>
                  <button onClick={() => remove(l.foodId)} className="text-muted-foreground p-1 self-start">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border">
              <Tag className="h-4 w-4 text-accent" />
              <input
                placeholder="Promo code"
                defaultValue={discount ? "WELCOME20" : ""}
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button className="text-xs font-semibold text-accent">Apply</button>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 space-y-2.5">
              <Row label="Subtotal" value={formatLKR(subtotal)} />
              <Row label="Delivery fee" value={formatLKR(delivery)} />
              {discount > 0 && <Row label="Promo (WELCOME20)" value={`- ${formatLKR(discount)}`} accent />}
              <div className="border-t border-border my-1" />
              <Row label="Total" value={formatLKR(total)} bold />
            </div>
          </div>

          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-background/95 backdrop-blur-xl border-t border-border px-5 py-4"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          >
            <button
              onClick={() => nav({ to: "/checkout" })}
              className="w-full h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition flex items-center justify-between px-5"
            >
              <span>Proceed to checkout</span>
              <span>{formatLKR(total)}</span>
            </button>
          </div>
        </>
      )}
    </MobileShell>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={`${bold ? "font-display text-lg font-bold" : "font-semibold"} ${accent ? "text-accent" : ""}`}>{value}</span>
    </div>
  );
}
