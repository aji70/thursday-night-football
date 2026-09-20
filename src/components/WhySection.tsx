import { SectionHeading } from "@/components/SectionHeading";
import { benefits } from "@/data/league";

export function WhySection() {
  return (
    <section id="why" className="border-t border-line py-16 sm:py-24">
      <div className="section-shell grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="01 — Executive Summary"
            title="The death of winner stays on"
            lede="Thursdays run 7:00–8:30 PM at Kadwell Pitch. Turnout swings from 12 to 30 players, with about 15 regulars and a visitor mix that can hit 20–70%."
          />
          <p className="prose-width print-muted mt-5 text-base leading-relaxed text-muted">
            The old 7-minute hard-stop format left side-lined teams cold and short
            on game time. We are moving entirely to a{" "}
            <strong className="font-semibold text-chalk">
              time-capped league rotation
            </strong>
            . When your match clock ends, you step off — win, draw, or lose.
            Everyone who pays and shows up gets equal, guaranteed minutes.
          </p>
        </div>

        <div id="benefits" className="border-t border-line pt-2 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
          <p className="print-accent mb-6 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-flood">
            02 — What this fixes
          </p>
          <ul className="space-y-0">
            {benefits.map((item) => (
              <li
                key={item.title}
                className="border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <p className="font-display print-ink text-2xl tracking-[0.03em] text-chalk">
                  {item.title}
                </p>
                <p className="print-muted mt-2 max-w-md text-[0.95rem] leading-relaxed text-muted">
                  {item.copy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
