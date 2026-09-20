"use client";

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

const sectionLinks = [
  { href: "#why", label: "Why" },
  { href: "#format", label: "Format" },
  { href: "#ops", label: "Ops" },
  { href: "#pitch-rules", label: "Pitch" },
  { href: "#rules", label: "Fines" },
  { href: "#fixtures", label: "Fixtures" },
  { href: "#log", label: "Log" },
];

export function SiteHeader() {
  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 border-b border-transparent bg-gradient-to-b from-pitch-deep/95 via-pitch-deep/70 to-transparent backdrop-blur-sm">
      <div className="section-shell flex h-14 items-center justify-between gap-3 sm:h-16">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.12em] text-flood transition hover:text-flood-soft"
        >
          TNF
        </Link>
        <SiteNav variant="home" sectionLinks={sectionLinks} />
      </div>
    </header>
  );
}
