import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Happy Home Restaurant" },
      { name: "description", content: "Visit Happy Home at 24 Galle Face Terrace, Colombo. Call, email, or get directions." },
      { property: "og:title", content: "Contact — Happy Home Restaurant" },
      { property: "og:description", content: "Visit, call, or email Happy Home." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const channels = [
  { icon: MapPin, label: "Visit", value: "24 Galle Face Terrace\nColombo 03, Sri Lanka", href: "https://maps.google.com/?q=Galle+Face+Terrace+Colombo", action: "Get directions" },
  { icon: Phone, label: "Call", value: "+94 11 234 5678", href: "tel:+94112345678", action: "Tap to call" },
  { icon: Mail, label: "Email", value: "hello@happyhome.lk", href: "mailto:hello@happyhome.lk", action: "Send a message" },
  { icon: Clock, label: "Hours", value: "Tue – Sun\n6:00 pm – 11:00 pm", href: "/reservations", action: "Book a table" },
];

function ContactPage() {
  return (
    <PageShell>
      <section className="container-luxe py-20">
        <SectionTitle
          eyebrow="Contact"
          title="Come and find us."
          lead="A townhouse on the Terrace, three doors from the ocean. The brass door is always the right one."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative rounded-sm border border-border bg-card p-8 transition-all hover:border-gold/50 hover:shadow-luxe"
            >
              <c.icon className="h-6 w-6 text-gold" />
              <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.label}</div>
              <div className="mt-2 font-display text-2xl whitespace-pre-line leading-snug">{c.value}</div>
              <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                {c.action}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 aspect-[21/9] overflow-hidden rounded-sm border border-border"
        >
          <iframe
            title="Happy Home location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=79.84%2C6.92%2C79.86%2C6.94&layer=mapnik"
            className="h-full w-full grayscale contrast-125 brightness-75"
            loading="lazy"
          />
        </motion.div>
      </section>
    </PageShell>
  );
}
