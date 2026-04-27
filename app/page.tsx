import { SystemShell } from "@/components/system-shell"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ProjectsSection } from "@/components/projects-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <SystemShell>
      <HeroSection />

      {/* Scroll canvas spacer — HERO → ABOUT */}
      <div aria-hidden="true" className="h-[40svh]" />

      <AboutSection />

      {/* Scroll canvas spacer — ABOUT → PROJECTS */}
      <div aria-hidden="true" className="h-[48svh]" />

      <ProjectsSection />

      {/* Scroll canvas spacer — PROJECTS → CTA / tail zone */}
      <div aria-hidden="true" className="h-[56svh]" />

      {/* DISCONNECTED: ContactSection (CTA) */}
      {/* <ContactSection /> */}
    </SystemShell>
  )
}