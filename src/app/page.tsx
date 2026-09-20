import { FixturesSection } from "@/components/FixturesSection";
import { FormatSection } from "@/components/FormatSection";
import { Hero } from "@/components/Hero";
import { LeagueOpsSection } from "@/components/LeagueOpsSection";
import { MatchLogSection } from "@/components/MatchLogSection";
import { PitchRulesSection } from "@/components/PitchRulesSection";
import { RulesSection } from "@/components/RulesSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhySection } from "@/components/WhySection";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
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
