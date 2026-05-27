import Link from 'next/link';

const modules = [
  { href: '/orders', label: 'Orders', description: 'Live order queue and status updates' },
  { href: '/menu', label: 'Menu', description: 'Categories, items, and pricing' },
  { href: '/riders', label: 'Riders', description: 'Delivery fleet and assignments' },
  { href: '/analytics', label: 'Analytics', description: 'Revenue, volume, and trends' },
] as const;

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Operations</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Happy Home Admin</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Manage orders, menu, riders, and restaurant analytics from one dashboard.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-amber-600/40"
          >
            <h2 className="text-lg font-medium">{module.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
