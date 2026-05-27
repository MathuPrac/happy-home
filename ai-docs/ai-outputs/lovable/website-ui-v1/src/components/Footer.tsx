import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 mt-32">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-4">
        <div>
          <div className="font-display text-3xl">Happy <span className="gradient-text">Home</span></div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            A modern table for the soulful flavours of Sri Lanka and India.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">Visit</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-gold" /> 24 Galle Face Terrace, Colombo</li>
            <li className="flex gap-3"><Clock className="h-4 w-4 mt-0.5 text-gold" /> Tue–Sun · 6pm – 11pm</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="tel:+94112345678" className="flex gap-3 hover:text-foreground transition-colors"><Phone className="h-4 w-4 mt-0.5 text-gold" /> +94 11 234 5678</a></li>
            <li><a href="mailto:hello@happyhome.lk" className="flex gap-3 hover:text-foreground transition-colors"><Mail className="h-4 w-4 mt-0.5 text-gold" /> hello@happyhome.lk</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">Explore</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/menu" className="text-muted-foreground hover:text-foreground transition-colors">Menu</Link></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
            <li><Link to="/reservations" className="text-muted-foreground hover:text-foreground transition-colors">Reservations</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="hairline" />
      <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Happy Home Restaurant. All rights reserved.</p>
        <p className="tracking-[0.2em] uppercase">Crafted with care</p>
      </div>
    </footer>
  );
}
