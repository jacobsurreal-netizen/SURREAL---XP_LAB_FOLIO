import { SystemShell } from "@/components/system-shell";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProjectsSection } from "@/components/projects-section";
import { ContactSection } from "@/components/contact-section";

export default function Home() {
  return (
    <SystemShell>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      {/* DISCONNECTED: ContactSection (CTA) */}
      {/* <ContactSection /> */}
    </SystemShell>
  );
}
