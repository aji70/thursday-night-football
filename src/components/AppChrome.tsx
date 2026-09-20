"use client";

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

export function AppChrome({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-pitch-deep/95 backdrop-blur-sm">
        <div className="section-shell flex h-14 items-center justify-between gap-4 sm:h-16">
          <Link
            href="/"
            className="font-display shrink-0 text-xl tracking-[0.12em] text-flood"
          >
            TNF
          </Link>
          <SiteNav variant="app" />
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
