"use client";

import Link from "next/link";

const pageLinks = [
  { href: "/tables", label: "Tables" },
  { href: "/players", label: "Players" },
  { href: "/payments", label: "Payments" },
  { href: "/purse", label: "Purse" },
  { href: "/me", label: "My profile" },
  { href: "/register", label: "Register" },
];

const sectionLinks = [
  { href: "#why", label: "Why" },
  { href: "#format", label: "Format" },
  { href: "#ops", label: "Table" },
  { href: "#pitch-rules", label: "Pitch" },
  { href: "#rules", label: "Fines" },
  { href: "#fixtures", label: "Fixtures" },
  { href: "#log", label: "Match Log" },
];

export function SiteHeader() {
  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 border-b border-transparent bg-gradient-to-b from-pitch-deep/95 via-pitch-deep/70 to-transparent backdrop-blur-sm">
      <div className="section-shell flex h-14 items-center justify-between gap-3 sm:h-16">
        <a
          href="#top"
          className="font-display text-xl tracking-[0.12em] text-flood transition hover:text-flood-soft"
        >
          TNF
        </a>

        <nav
          className="hidden items-center gap-4 lg:flex xl:gap-5"
          aria-label="Primary"
        >
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-flood-soft transition hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-chalk"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="bg-flood px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-pitch-deep transition hover:bg-flood-soft"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
