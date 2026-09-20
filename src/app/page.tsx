import { Hero } from "@/components/Hero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <div className="bg-pitch-deep">
      <SiteHeader />
      <main>
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
}
