import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import interiorImg from "@/assets/interior.jpg";
import { PageShell, SectionTitle } from "@/components/PageShell";
import { AppCTA } from "@/components/AppCTA";
import { dishes } from "@/lib/menu-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Home — Modern Sri Lankan & Indian Fine Dining" },
      { name: "description", content: "Happy Home Restaurant. A modern, minimal and luxurious table for the soulful flavours of Sri Lanka and India in the heart of Colombo." },
      { property: "og:title", content: "Happy Home — Modern Sri Lankan & Indian Fine Dining" },
      { property: "og:description", content: "A modern, minimal table for the soulful flavours of Sri Lanka and India." },
      { property: "og:type", content: "restaurant" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: "Happy Home Restaurant",
        servesCuisine: ["Sri Lankan", "Indian"],
        priceRange: "$$$",
        address: { "@type": "PostalAddress", streetAddress: "24 Galle Face Terrace", addressLocality: "Colombo", addressCountry: "LK" },
        telephone: "+94112345678",
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  const signatures = dishes.filter((d) => d.signature).slice(0, 3);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative -mt-20 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        </div>

        <div className="container-luxe relative z-10 pt-32 pb-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold"
            >
              <span className="h-px w-10 bg-gold" /> Sri Lankan · Indian · Est. 1998
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9 }}
              className="mt-6 font-display text-6xl md:text-8xl leading-[0.95] tracking-tight"
            >
              A modern table <br />
              for <span className="gradient-text italic">timeless</span> spice.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              Two heritages, one quiet room. Chef Anika reimagines the grandmothers' classics of Colombo and Kerala — composed with restraint, plated with intention.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                to="/reservations"
                className="group inline-flex items-center justify-center gap-3 rounded-sm bg-gold px-8 py-4 text-sm uppercase tracking-[0.25em] text-primary-foreground transition-all hover:shadow-luxe"
              >
                Reserve a table
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-foreground hover:text-gold transition-colors"
              >
                View the menu →
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
        >
          Scroll
        </motion.div>
      </section>

      {/* PHILOSOPHY */}
      <section className="container-luxe py-32 grid gap-16 md:grid-cols-2 md:items-center">
        <SectionTitle
          eyebrow="The philosophy"
          title="Heritage, plated quietly."
          lead="We cook from memory — the brass pots of a Jaffna kitchen, the tandoors of old Delhi. Then we strip everything back: one technique, one ingredient at the centre, one perfect bite. No theatre. Just intention."
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative aspect-[4/5] overflow-hidden rounded-sm"
        >
          <img src={interiorImg} alt="Happy Home dining room" loading="lazy" width={1400} height={900} className="h-full w-full object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
        </motion.div>
      </section>

      {/* SIGNATURES */}
      <section className="container-luxe py-24">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <SectionTitle eyebrow="Signatures" title="Dishes we are known for." />
          <Link to="/menu" className="text-sm uppercase tracking-[0.25em] text-gold hover:text-gold-soft transition-colors">
            Full menu →
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {signatures.map((d, i) => (
            <motion.article
              key={d.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-gold/40 hover:shadow-luxe"
            >
              {d.image && (
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-7">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                  <Star className="h-3 w-3 fill-current" /> {d.cuisine}
                </div>
                <h3 className="mt-3 font-display text-2xl">{d.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-display text-xl text-gold">${d.price}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{d.category}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* APP */}
      <AppCTA />
    </PageShell>
  );
}
