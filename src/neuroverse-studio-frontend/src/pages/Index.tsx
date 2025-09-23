import ServicesSection from "@/components/sections/ServicesSection";
import HowToUseSection from "@/components/sections/HowToUseSection";
import FAQSection from "@/components/sections/FAQSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import { Suspense, lazy } from "react";
import { LoadingAgentsFallback } from "@/components/agent/LoadingAgentsFallback";
import CallToAction from "@/components/sections/CTASection";
import HeroSection from "@/components/sections/HeroSection";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

// Lazy load heavy components
const LazyAgentGrid = lazy(() => import("@/components/home/AgentGrid"));

const Index = () => {
  return (
    <div className="space-y-20">
      {/* Background Effects
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-acid-green/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,240,255,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(155,93,229,0.15),transparent_50%)]"></div> */}

      {/* Immersive Hero Section */}
      <HeroSection />

      <section className="relative container max-w-6xl">
        <HeroVideoDialog
          className="block dark:hidden"
          animationStyle="from-center"
          videoSrc="https://www.youtube-nocookie.com/embed/unUvcGStOeY?si=KX5737jNn3C4voQx"
          thumbnailSrc="thumbnails/demo_video_thumbnail.png"
          thumbnailAlt="Neuroverse Demo Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="from-center"
          videoSrc="https://www.youtube-nocookie.com/embed/unUvcGStOeY?si=KX5737jNn3C4voQx"
          thumbnailSrc="thumbnails/demo_video_thumbnail.png"
          thumbnailAlt="Neuroverse Demo Video"
        />
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* How to Use Section */}
      <HowToUseSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Agent Grid with Lazy Loading */}
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-orbitron font-bold holographic-text">
            Discover AI Agents
          </h2>
          <p className="text-md sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our collection of intelligent agents, each specialized for
            different tasks and powered by advanced AI models.
          </p>
        </div>
        <Suspense fallback={<LoadingAgentsFallback />}>
          <LazyAgentGrid />
        </Suspense>
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/*CALL TO ACTION SECTION*/}
      <CallToAction />
    </div>
  );
};

export default Index;
