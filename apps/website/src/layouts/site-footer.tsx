import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-card/40">
      <div className="container-luxe grid gap-12 py-20 md:grid-cols-4">
        <div>
          <div className="font-display text-3xl">
            Happy <span className="gradient-text">Home</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A modern table for the soulful flavours of Sri Lanka and India.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-xs uppercase tracking-[0.25em] text-gold">Visit</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-gold" /> 24 Galle Face Terrace, Colombo
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-gold" /> Tue–Sun · 6pm – 11pm
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs uppercase tracking-[0.25em] text-gold">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <a
                href="tel:+94112345678"
                className="flex gap-3 transition-colors hover:text-foreground"
              >
                <Phone className="mt-0.5 h-4 w-4 text-gold" /> +94 11 234 5678
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@happyhome.lk"
                className="flex gap-3 transition-colors hover:text-foreground"
              >
                <Mail className="mt-0.5 h-4 w-4 text-gold" /> hello@happyhome.lk
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs uppercase tracking-[0.25em] text-gold">Explore</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/menu" className="text-muted-foreground transition-colors hover:text-foreground">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link
                href="/reservations"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Reservations
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="hairline" />
      <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} Happy Home Restaurant. All rights reserved.</p>
        <p className="uppercase tracking-[0.2em]">Crafted with care</p>
      </div>
    </footer>
  );
}
