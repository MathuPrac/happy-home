import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MapPin, Search as SearchIcon, ChevronRight, Calendar, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { MobileShell } from "@/components/layout/MobileShell";
import { TabBar } from "@/components/layout/TabBar";
import { CategoryCard } from "@/components/common/CategoryCard";
import { FoodCard } from "@/components/common/FoodCard";
import { OfferBanner } from "@/components/common/OfferBanner";
import { CATEGORIES, FOODS, PROMOTIONS, USER } from "@/constants/mock-data";

export const Route = createFileRoute("/home")({
  component: Home,
});

function Home() {
  const popular = FOODS.filter((f) => f.popular);
  const featured = FOODS.slice(0, 6);

  return (
    <MobileShell withTabBar>
      {/* Header */}
      <header className="px-5 pt-3 pb-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={USER.avatar} alt="" className="h-11 w-11 rounded-full ring-2 ring-accent/40 bg-secondary" />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Deliver to
              </p>
              <p className="text-sm font-semibold leading-tight">Cinnamon Gardens, C07</p>
            </div>
          </div>
          <Link
            to="/notifications"
            className="relative grid place-items-center h-11 w-11 rounded-full bg-card border border-border"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-spice" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          <h1 className="font-display text-[26px] leading-tight font-bold">
            Good evening, <span className="text-accent">{USER.name.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-muted-foreground">What are we craving tonight?</p>
        </motion.div>

        <Link
          to="/search"
          className="mt-5 flex items-center gap-3 h-13 px-4 py-3.5 rounded-2xl bg-card border border-border"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search "Butter Chicken", "Kottu"…</span>
        </Link>
      </header>

      {/* Promotions */}
      <section className="mt-2">
        <div className="flex overflow-x-auto no-scrollbar gap-3 px-5 pb-2 snap-x snap-mandatory">
          {PROMOTIONS.map((p) => (
            <div key={p.id} className="snap-center">
              <OfferBanner promo={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <SectionHead title="Categories" to="/categories" />
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-5 pt-3 pb-2">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3 px-5 mt-6">
        <Link to="/reservation" className="rounded-2xl p-4 bg-card border border-border active:scale-[0.98] transition">
          <Calendar className="h-5 w-5 text-accent" />
          <p className="font-semibold mt-2 text-sm">Reserve a table</p>
          <p className="text-[11px] text-muted-foreground">Book in seconds</p>
        </Link>
        <Link to="/loyalty" className="rounded-2xl p-4 bg-gradient-to-br from-accent to-gold text-accent-foreground active:scale-[0.98] transition">
          <Crown className="h-5 w-5" />
          <p className="font-semibold mt-2 text-sm">{USER.loyaltyPoints.toLocaleString()} pts</p>
          <p className="text-[11px] opacity-80">{USER.tier} member</p>
        </Link>
      </section>

      {/* Popular */}
      <section className="mt-8">
        <SectionHead title="Most loved tonight" to="/search" />
        <div className="grid grid-cols-2 gap-3 px-5 pt-3">
          {popular.map((f) => (
            <FoodCard key={f.id} item={f} />
          ))}
        </div>
      </section>

      {/* Chef's selection horizontal */}
      <section className="mt-8">
        <SectionHead title="Chef's selection" to="/search" />
        <div className="flex overflow-x-auto no-scrollbar gap-3 px-5 pt-3 pb-4">
          {featured.map((f) => (
            <FoodCard key={f.id} item={f} variant="compact" />
          ))}
        </div>
      </section>

      <div className="h-8" />
      <TabBar />
    </MobileShell>
  );
}

function SectionHead({ title, to }: { title: string; to: "/categories" | "/search" }) {
  return (
    <div className="flex items-center justify-between px-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <Link to={to} className="text-xs text-accent font-semibold flex items-center gap-0.5">
        See all <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
