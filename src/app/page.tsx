import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-pitch-deep">
      <SiteHeader />
      <main>
        <Hero />
      </main>
    </div>
  );
}
