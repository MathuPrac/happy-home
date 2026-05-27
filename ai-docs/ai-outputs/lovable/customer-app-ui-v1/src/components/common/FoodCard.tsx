import { Link } from "@tanstack/react-router";
import { Heart, Star, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { FoodItem } from "@/types";
import { useFavorites } from "@/store/favorites";
import { formatLKR } from "@/utils/format";

interface Props {
  item: FoodItem;
  variant?: "grid" | "wide" | "compact";
}

export function FoodCard({ item, variant = "grid" }: Props) {
  const fav = useFavorites((s) => s.ids.includes(item.id));
  const toggle = useFavorites((s) => s.toggle);

  if (variant === "wide") {
    return (
      <Link
        to="/food/$id"
        params={{ id: item.id }}
        className="flex gap-3 p-3 rounded-2xl bg-card border border-border active:scale-[0.99] transition"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-24 w-24 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold leading-tight truncate">{item.name}</h3>
            <button
              onClick={(e) => { e.preventDefault(); toggle(item.id); }}
              className="text-muted-foreground active:scale-90 transition"
              aria-label="Favorite"
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-spice text-spice" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{item.rating}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.prepMinutes}m</span>
            </div>
            <span className="font-display font-bold text-accent">{formatLKR(item.price)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to="/food/$id" params={{ id: item.id }} className="block w-40 flex-shrink-0">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="mt-2 px-1">
          <h4 className="text-sm font-semibold truncate">{item.name}</h4>
          <p className="text-xs text-accent font-bold mt-0.5">{formatLKR(item.price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="group">
      <Link to="/food/$id" params={{ id: item.id }} className="block">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <button
            onClick={(e) => { e.preventDefault(); toggle(item.id); }}
            className="absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full bg-black/40 backdrop-blur-md active:scale-90 transition"
            aria-label="Favorite"
          >
            <Heart className={`h-4 w-4 text-white ${fav ? "fill-spice text-spice" : ""}`} />
          </button>
          {item.tags?.[0] && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent/95 text-accent-foreground text-[10px] font-bold tracking-wide uppercase">
              {item.tags[0]}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
            <div className="flex items-center gap-2 text-[10px] mb-1.5 opacity-90">
              <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5 fill-accent text-accent" />{item.rating}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{item.prepMinutes}m</span>
              {item.spicyLevel > 1 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5 text-spice" />Spicy</span>
                </>
              )}
            </div>
            <h3 className="font-display font-semibold leading-tight line-clamp-1">{item.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="font-display text-base font-bold text-accent">{formatLKR(item.price)}</span>
              <span className="grid place-items-center h-8 w-8 rounded-full bg-accent text-accent-foreground text-lg font-bold leading-none">+</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
