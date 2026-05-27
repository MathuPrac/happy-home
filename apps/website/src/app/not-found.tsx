import Link from 'next/link';
import { PageShell } from '@/layouts/page-shell';

export default function NotFound() {
  return (
    <PageShell>
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-sm uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-luxe"
        >
          Go home
        </Link>
      </div>
    </PageShell>
  );
}
