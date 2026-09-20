import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <div className="h-dvh overflow-hidden">
      <SiteHeader />
      <main className="h-full">
        <Hero />
      </main>
    </div>
  );
}
