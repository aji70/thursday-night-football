"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((data) => {
        if (data.player) {
          setLoggedIn(true);
          setName(data.player.name?.split(" ")[0] ?? null);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-start overflow-hidden"
      aria-label="Thursday Night Football"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-pitch-night.png"
          alt="Floodlit football pitch at night"
          fill
          priority
          className="hero-kenburns object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pitch-deep/70 via-pitch-deep/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch-deep via-pitch-deep/45 to-pitch-deep/30" />
      </div>

      <div className="section-shell hero-copy w-full pb-16 pt-20 sm:pb-20 sm:pt-24">
        <p className="font-display print-ink text-[clamp(2.75rem,10vw,5.75rem)] leading-[0.9] tracking-[0.04em] text-chalk">
          Thursday Night Football
        </p>
        <h1 className="font-display print-accent mt-3 max-w-[14ch] text-[clamp(1.9rem,5vw,3.25rem)] leading-[1.05] tracking-[0.02em] text-flood">
          Equal minutes. Real competition.
        </h1>
        <p className="prose-width print-muted mt-5 text-[clamp(1.05rem,2.2vw,1.2rem)] font-light leading-relaxed text-chalk/90">
          A time-capped league that ends winner-stays-on and guarantees every
          player a proper night on the pitch.
        </p>
        <div className="no-print mt-8 flex flex-wrap gap-3">
          {loggedIn ? (
            <Link
              href="/me"
              className="bg-flood px-5 py-3 text-sm font-semibold tracking-wide text-pitch-deep transition hover:bg-flood-soft"
            >
              {name ? `My profile · ${name}` : "My profile"}
            </Link>
          ) : (
            <Link
              href="/register"
              className="bg-flood px-5 py-3 text-sm font-semibold tracking-wide text-pitch-deep transition hover:bg-flood-soft"
            >
              Register to play
            </Link>
          )}
          <Link
            href="/rules"
            className="border border-chalk/30 px-5 py-3 text-sm font-semibold tracking-wide text-chalk transition hover:border-flood hover:text-flood"
          >
            Read the rules
          </Link>
          <Link
            href="/tables"
            className="border border-chalk/30 px-5 py-3 text-sm font-semibold tracking-wide text-chalk transition hover:border-flood hover:text-flood"
          >
            League table
          </Link>
        </div>
      </div>
    </section>
  );
}
