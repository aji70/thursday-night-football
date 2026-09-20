"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { findNextFixture, findNextSession } from "@/lib/next-match";
import { fixturesByWeek } from "@/data/league";
import { PAYMENT_CYCLE } from "@/lib/league-db";

type NextMatch = {
  week: number;
  match: number;
  dateLabel: string;
  time: string;
  opponentLabel: string;
} | null;

type NewsItem = {
  id: string;
  title: string;
  summary?: string | null;
  pinned?: boolean;
} | null;

const stripCardClass =
  "border border-chalk/20 bg-pitch-deep/95 px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-flood/45";

function formatWeekDate(week: 1 | 2 | 3 | 4) {
  const ymd = PAYMENT_CYCLE.weekDates[week];
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function Hero() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nextMatch, setNextMatch] = useState<NextMatch>(null);
  const [news, setNews] = useState<NewsItem>(null);
  const [newsChecked, setNewsChecked] = useState(false);
  const nextFixture = findNextFixture();
  const nextSession = findNextSession();

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

    fetch("/api/news?limit=1")
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        const post =
          data?.posts?.[0] ?? data?.post ?? data?.items?.[0] ?? null;
        if (post?.title) {
          setNews({
            id: post.id,
            title: post.title,
            summary: post.summary ?? post.excerpt ?? null,
            pinned: Boolean(post.pinned),
          });
        }
      })
      .catch(() => {})
      .finally(() => setNewsChecked(true));
  }, []);

  return (
    <>
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
                "linear-gradient(to top, rgba(6,21,15,0.88) 0%, rgba(6,21,15,0.3) 50%, rgba(6,21,15,0.5) 100%)",
            }}
          />
        </div>

        <div className="section-shell relative flex flex-col gap-6 pt-[4.75rem] pb-8 sm:gap-7 sm:pt-[5.25rem] sm:pb-10">
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
            <div className="no-print mt-6 flex flex-wrap gap-3">
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

          <div className="no-print grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            {news ? (
              <Link href={`/news/${news.id}`} className={stripCardClass}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  {news.pinned ? "Pinned" : "Latest"}
                </p>
                <p className="mt-1.5 font-semibold leading-snug text-chalk">
                  {news.title}
                </p>
                {news.summary ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                    {news.summary}
                  </p>
                ) : null}
              </Link>
            ) : (
              <div className={stripCardClass}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  News
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted">
                  {newsChecked
                    ? "No news yet — check back after Matchday 1"
                    : "Loading…"}
                </p>
              </div>
            )}

            {nextFixture ? (
              <a href="#fixtures" className={stripCardClass}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  Next fixture
                </p>
                <p className="mt-1.5 font-semibold leading-snug text-chalk">
                  {nextFixture.fixture}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {nextFixture.dateLabel} · {nextFixture.kickoff}
                </p>
              </a>
            ) : (
              <div className={stripCardClass}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  Next fixture
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  Check back after Matchday 1
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="fixtures"
        className="border-t border-line bg-pitch-deep py-10 sm:py-12"
      >
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-flood">
                Fixtures
              </p>
              <h2 className="font-display mt-1 text-2xl text-chalk sm:text-3xl">
                {nextSession
                  ? `Week ${nextSession.week} · ${nextSession.dateLabel}`
                  : "Full cycle"}
              </h2>
            </div>
            <Link
              href="/rules#fixtures"
              className="text-sm text-flood hover:underline"
            >
              Full matrix on Rules
            </Link>
          </div>

          {nextSession ? (
            <ul className="mt-6 divide-y divide-line border border-line">
              {nextSession.fixtures.map((row) => (
                <li
                  key={row.match}
                  className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[4rem_8rem_1fr_8rem]"
                >
                  <span className="font-display text-lg text-flood">
                    {row.match}
                  </span>
                  <span className="hidden text-sm text-muted sm:block">
                    {row.time}
                  </span>
                  <span className="font-semibold text-chalk">{row.fixture}</span>
                  <span className="text-right text-xs text-muted sm:text-sm">
                    <span className="sm:hidden">{row.time}</span>
                    <span className="hidden sm:inline">
                      Panel {row.officiating}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-muted">
              Check back after Matchday 1 — fixtures will show here.
            </p>
          )}

          <div className="mt-10">
            <h3 className="font-display text-xl text-chalk">All weeks</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {([1, 2, 3, 4] as const).map((week) => (
                <div key={week} className="border border-line">
                  <div className="border-b border-flood/30 bg-black/20 px-4 py-2.5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-flood">
                      Week {week} · {formatWeekDate(week)}
                    </p>
                  </div>
                  <ul className="divide-y divide-line">
                    {fixturesByWeek[week].map((row) => (
                      <li
                        key={row.match}
                        className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm"
                      >
                        <span className="text-chalk">
                          <span className="text-flood">{row.match}.</span>{" "}
                          {row.fixture}
                        </span>
                        <span className="shrink-0 text-muted">{row.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
