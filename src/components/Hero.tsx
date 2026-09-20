"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { venue } from "@/data/league";
import { findNextSession } from "@/lib/next-match";

type NextMatch = {
  week: number;
  match: number;
  dateLabel: string;
  time: string;
  opponentLabel: string;
} | null;

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nextMatch, setNextMatch] = useState<NextMatch>(null);
  const session = findNextSession();

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.player) return;
        setLoggedIn(true);
        try {
          const meRes = await fetch("/api/me");
          if (!meRes.ok) return;
          const me = await meRes.json();
          if (me.nextMatch) {
            setNextMatch({
              week: me.nextMatch.week,
              match: me.nextMatch.match,
              dateLabel: me.nextMatch.dateLabel,
              time: me.nextMatch.time,
              opponentLabel: me.nextMatch.opponentLabel,
            });
          }
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
  }, []);

  const previewFixtures = session?.fixtures.slice(0, 2) ?? [];

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden"
      aria-label="Thursday Night Football"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-pitch-night.png"
          alt="Floodlit football pitch at night"
          fill
          priority
          className="hero-kenburns object-cover object-[70%_center]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(6,21,15,0.92) 0%, rgba(6,21,15,0.72) 38%, rgba(6,21,15,0.28) 68%, rgba(6,21,15,0.12) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(6,21,15,0.88) 0%, rgba(6,21,15,0.35) 42%, rgba(6,21,15,0.45) 100%)",
          }}
        />
      </div>

      <div className="section-shell relative flex flex-col gap-8 pt-[4.75rem] pb-8 sm:gap-10 sm:pt-[5.25rem] sm:pb-10">
        <div className="hero-copy max-w-3xl">
          <p className="font-display print-ink text-[clamp(2.35rem,7.5vw,4.25rem)] leading-[0.9] tracking-[0.04em] text-chalk drop-shadow-[0_2px_14px_rgba(6,21,15,0.7)]">
            Thursday Night Football
          </p>
          <h1 className="font-display print-accent mt-2 text-[clamp(1.55rem,4vw,2.5rem)] leading-[1.08] tracking-[0.02em] text-flood">
            Equal minutes.
            <br />
            Real competition.
          </h1>
          <p className="prose-width print-muted mt-4 max-w-md text-[clamp(0.98rem,1.8vw,1.12rem)] font-light leading-relaxed text-chalk">
            A time-capped league that ends winner-stays-on and guarantees every
            player a proper night on the pitch.
          </p>
          <div className="no-print mt-7 flex flex-wrap gap-3">
            {loggedIn ? (
              nextMatch ? (
                <Link
                  href="/me"
                  className="bg-flood px-5 py-3 text-sm font-semibold tracking-wide text-pitch-deep transition hover:bg-flood-soft"
                >
                  Next · vs {nextMatch.opponentLabel} · {nextMatch.time}
                </Link>
              ) : (
                <Link
                  href="/me"
                  className="bg-flood px-5 py-3 text-sm font-semibold tracking-wide text-pitch-deep transition hover:bg-flood-soft"
                >
                  Open dashboard
                </Link>
              )
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
              className="border border-chalk/35 bg-pitch-deep/40 px-5 py-3 text-sm font-semibold tracking-wide text-chalk backdrop-blur-[2px] transition hover:border-flood hover:text-flood"
            >
              Read the rules
            </Link>
            <Link
              href="/tables"
              className="border border-chalk/35 bg-pitch-deep/40 px-5 py-3 text-sm font-semibold tracking-wide text-chalk backdrop-blur-[2px] transition hover:border-flood hover:text-flood"
            >
              League table
            </Link>
          </div>
        </div>

        {/* Fixtures strip — no news until that ships */}
        <div className="no-print w-full max-w-3xl">
          {session ? (
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              <Link
                href="/rules#fixtures"
                className="min-w-[11.5rem] shrink-0 border border-line bg-pitch-deep/55 px-4 py-3 backdrop-blur-sm transition hover:border-flood/50 sm:min-w-0"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  Next matchday
                </p>
                <p className="mt-1.5 font-display text-xl leading-none text-chalk">
                  Week {session.week}
                </p>
                <p className="mt-1.5 text-sm text-chalk/90">{session.dateLabel}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {venue.name} · {venue.session}
                </p>
              </Link>
              {previewFixtures.map((row) => (
                <Link
                  key={row.match}
                  href="/rules#fixtures"
                  className="min-w-[11.5rem] shrink-0 border border-line bg-pitch-deep/55 px-4 py-3 backdrop-blur-sm transition hover:border-flood/50 sm:min-w-0"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                    Match {row.match}
                  </p>
                  <p className="mt-1.5 font-semibold leading-snug text-chalk">
                    {row.fixture}
                  </p>
                  <p className="mt-1.5 text-sm text-muted">{row.time}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="border border-line bg-pitch-deep/55 px-4 py-3 text-sm text-muted backdrop-blur-sm">
              Check back after Matchday 1 — fixtures will show here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
