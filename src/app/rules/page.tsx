import { FixturesSection } from "@/components/FixturesSection";
import { FormatSection } from "@/components/FormatSection";
import { LeagueOpsSection } from "@/components/LeagueOpsSection";
import { MatchLogSection } from "@/components/MatchLogSection";
import { PitchRulesSection } from "@/components/PitchRulesSection";
import { RulesSection } from "@/components/RulesSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhySection } from "@/components/WhySection";

export default function RulesPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-14 sm:pt-16">
        <div className="section-shell border-b border-line py-10 sm:py-14">
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.02em] text-chalk">
            League rules
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            This page explains the <span className="text-chalk">new proposal</span>{" "}
            in full — why we are leaving winner-stays-on, how the time-capped
            league works, then format, fees, pitch laws, fines, fixtures, and
            the match log.
          </p>
          <p className="mt-5">
            <a
              href="/tnf-league-proposal.pdf"
              download
              className="inline-block bg-flood px-5 py-3 text-sm font-semibold tracking-wide text-pitch-deep transition hover:bg-flood-soft"
            >
              Download proposal PDF
            </a>
          </p>
        </div>
        <WhySection />
        <FormatSection />
        <LeagueOpsSection />
        <PitchRulesSection />
        <RulesSection />
        <FixturesSection />
        <MatchLogSection />
      </main>
      <SiteFooter />
    </>
  );
}
