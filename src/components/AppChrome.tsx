import Link from "next/link";

const links = [
  { href: "/", label: "Rules" },
  { href: "/tables", label: "Tables" },
  { href: "/players", label: "Players" },
  { href: "/payments", label: "Payments" },
  { href: "/purse", label: "Purse" },
  { href: "/me", label: "My profile" },
  { href: "/register", label: "Register" },
];

export function AppChrome({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-pitch-deep/80">
        <div className="section-shell flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link
            href="/"
            className="font-display text-xl tracking-[0.12em] text-flood"
          >
            TNF
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-chalk"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="section-shell py-10 sm:py-14">
        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] tracking-[0.02em] text-chalk">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
