"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { fixturesByWeek, type Fixture } from "@/data/league";

const weeks = [1, 2, 3, 4] as const;

function FixtureRows({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="border border-line">
      <div className="hidden grid-cols-[3.5rem_7.5rem_1fr_8rem] gap-4 border-b border-flood/30 bg-black/20 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-flood sm:grid sm:px-5">
        <span>#</span>
        <span>Time</span>
        <span>Fixture</span>
        <span>Panel</span>
      </div>
      {fixtures.map((row) => (
        <div
          key={row.match}
          className="grid grid-cols-[3rem_1fr] gap-x-3 gap-y-1 border-b border-line px-4 py-4 last:border-b-0 sm:grid-cols-[3.5rem_7.5rem_1fr_8rem] sm:items-center sm:gap-4 sm:px-5"
        >
          <span className="font-display print-accent text-xl text-flood-soft">
            {row.match}
          </span>
          <div className="sm:contents">
            <p className="print-muted text-sm text-muted sm:text-base">{row.time}</p>
            <p className="print-ink font-semibold text-chalk">{row.fixture}</p>
            <p className="print-muted col-span-2 text-sm text-muted sm:col-span-1 sm:text-right">
              {row.officiating}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FixturesSection() {
  const [week, setWeek] = useState<(typeof weeks)[number]>(1);

  return (
    <section id="fixtures" className="border-t border-line py-16 sm:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="07 — Fixtures Matrix"
          title="Four weeks. Six games a night."
          lede="Matches are 11 minutes with a hard 3-minute turnaround. Be on the touchline early."
        />

        <div className="no-print mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Fixture weeks">
          {weeks.map((w) => {
            const active = week === w;
            return (
              <button
                key={w}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setWeek(w)}
                className={`px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                  active
                    ? "bg-flood text-pitch-deep"
                    : "border border-line text-muted hover:border-chalk/35 hover:text-chalk"
                }`}
              >
                Week {w}
              </button>
            );
          })}
        </div>

        <div className="no-print mt-6" role="tabpanel">
          <FixtureRows fixtures={fixturesByWeek[week]} />
        </div>

        <div className="mt-8 hidden print-show-all space-y-8 print:block">
          {weeks.map((w) => (
            <div key={w}>
              <h3 className="font-display print-ink mb-3 text-xl text-chalk">
                Week {w}
              </h3>
              <FixtureRows fixtures={fixturesByWeek[w]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
