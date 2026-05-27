import type { LucideIcon } from 'lucide-react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export interface ContactChannel {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  action: string;
  external?: boolean;
}

export const contactChannels: ContactChannel[] = [
  {
    icon: MapPin,
    label: 'Visit',
    value: '24 Galle Face Terrace\nColombo 03, Sri Lanka',
    href: 'https://maps.google.com/?q=Galle+Face+Terrace+Colombo',
    action: 'Get directions',
    external: true,
  },
  {
    icon: Phone,
    label: 'Call',
    value: '+94 11 234 5678',
    href: 'tel:+94112345678',
    action: 'Tap to call',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@happyhome.lk',
    href: 'mailto:hello@happyhome.lk',
    action: 'Send a message',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Tue – Sun\n6:00 pm – 11:00 pm',
    href: '/reservations',
    action: 'Book a table',
  },
];
