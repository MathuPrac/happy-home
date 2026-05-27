import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import interiorImg from "@/assets/interior.jpg";
import { PageShell, SectionTitle } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Happy Home Restaurant" },
      { name: "description", content: "The story of Happy Home: a family of cooks from Colombo and Kerala bringing heritage to a modern table." },
      { property: "og:title", content: "About — Happy Home Restaurant" },
      { property: "og:description", content: "A family of cooks from Colombo and Kerala." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const milestones = [
  { year: "1998", text: "Amma opens a six-seat kade on Galle Road." },
  { year: "2011", text: "The family moves into the Terrace townhouse." },
  { year: "2019", text: "Chef Anika returns from Noma to lead the kitchen." },
  { year: "2024", text: "Named Best Restaurant in South Asia by Tatler." },
];

function AboutPage() {
  return (
    <PageShell>
      <section className="container-luxe pt-20 pb-32">
        <div className="grid gap-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Our story</div>
            <h1 className="mt-5 font-display text-5xl md:text-7xl leading-[1.02]">
              Two kitchens.<br />
              <span className="gradient-text italic">One quiet room.</span>
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Happy Home began as a six-seat kitchen on Galle Road, run by a grandmother who refused to write down a single recipe. Three decades on, her granddaughter still cooks from memory — only the room has changed.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mt-20 aspect-[16/9] overflow-hidden rounded-sm"
        >
          <img src={interiorImg} alt="Interior of Happy Home" loading="lazy" width={1400} height={900} className="h-full w-full object-cover" />
        </motion.div>
      </section>

      <section className="container-luxe pb-32 grid gap-20 md:grid-cols-2">
        <div>
          <SectionTitle eyebrow="The kitchen" title="Cooked from memory, plated with intention." />
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Our pantry is small and obsessive. Curry leaves from a single grove in Negombo. Saffron pulled from Kashmir. Coconuts cracked the morning of. Everything ground in stone — the only piece of equipment Amma insisted travel with us.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We don't fuse cuisines. We let Sri Lanka and India sit beside each other on the table the way they sit beside each other on the map — two voices, one quiet conversation.
          </p>
        </div>

        <div>
          <SectionTitle eyebrow="Milestones" title="Thirty years, a few quiet steps." />
          <ol className="mt-10 space-y-6">
            {milestones.map((m, i) => (
              <motion.li
                key={m.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-6 border-l border-border pl-6 relative"
              >
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-gold" />
                <span className="font-display text-2xl text-gold w-20 shrink-0">{m.year}</span>
                <p className="text-muted-foreground leading-relaxed pt-1">{m.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
