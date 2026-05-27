import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Heart, Star, Clock, Flame, Leaf, Share2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MobileShell } from "@/components/layout/MobileShell";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { FOODS } from "@/constants/mock-data";
import { useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { formatLKR } from "@/utils/format";

export const Route = createFileRoute("/food/$id")({
  component: FoodDetails,
});

function FoodDetails() {
  const { id } = Route.useParams();
  const router = useRouter();
  const nav = useNavigate();
  const item = FOODS.find((f) => f.id === id) ?? FOODS[0];
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const fav = useFavorites((s) => s.ids.includes(item.id));
  const toggleFav = useFavorites((s) => s.toggle);

  const handleAdd = () => {
    add(item.id, qty);
    nav({ to: "/cart" });
  };

  return (
    <MobileShell>
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        <div
          className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <button onClick={() => router.history.back()} className="grid place-items-center h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white active:scale-95 transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button className="grid place-items-center h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => toggleFav(item.id)} className="grid place-items-center h-10 w-10 rounded-full bg-black/30 backdrop-blur-md text-white">
              <Heart className={`h-4 w-4 ${fav ? "fill-spice text-spice" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative -mt-6 rounded-t-[28px] bg-background px-5 pt-6 pb-32"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {item.tags?.[0] && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider mb-2">
                {item.tags[0]}
              </span>
            )}
            <h1 className="font-display text-2xl font-bold leading-tight">{item.name}</h1>
          </div>
          <p className="font-display text-2xl font-bold text-accent">{formatLKR(item.price)}</p>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" /><span className="font-semibold">{item.rating}</span><span className="text-muted-foreground">({item.reviews})</span></div>
          <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{item.prepMinutes} min</div>
          {item.spicyLevel > 0 && (
            <div className="flex items-center gap-0.5 text-spice">
              {Array.from({ length: item.spicyLevel }).map((_, i) => <Flame key={i} className="h-3.5 w-3.5" />)}
            </div>
          )}
          {item.isVeg && <div className="flex items-center gap-1 text-success"><Leaf className="h-3.5 w-3.5" />Veg</div>}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-4">{item.description}</p>

        <div className="mt-6">
          <h3 className="font-display text-sm font-bold mb-3">Customize</h3>
          <div className="space-y-2">
            {["Add extra cheese (+Rs. 250)", "Make it extra spicy", "No coriander", "Side of raita (+Rs. 150)"].map((opt, i) => (
              <label key={opt} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                <input type="checkbox" defaultChecked={i === 0} className="accent-[var(--color-accent)] h-4 w-4" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-sm font-bold mb-2">Special instructions</h3>
          <textarea
            placeholder="e.g. less oil, no onions"
            className="w-full p-3 rounded-2xl bg-card border border-border text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent resize-none"
            rows={3}
          />
        </div>
      </motion.div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-background/95 backdrop-blur-xl border-t border-border px-5 py-4 z-40"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="flex items-center gap-3">
          <QuantitySelector value={qty} onChange={setQty} size="lg" />
          <button
            onClick={handleAdd}
            className="flex-1 h-13 py-3.5 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition flex items-center justify-between px-5"
          >
            <span>Add to cart</span>
            <span>{formatLKR(item.price * qty)}</span>
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
