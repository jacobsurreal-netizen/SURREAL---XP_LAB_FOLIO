"use client"

import { useEffect, useRef, useState } from "react"
import { ProcessOrbit } from "@/components/process-orbit"

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      const offset = 200
      const progressRaw =
       (windowHeight - (rect.top + offset)) /
       (rect.height + windowHeight * 0.5)
      const progress = Math.min(1, Math.max(0, progressRaw))

      let index = 0

      if (progress < 0.25) {
        index = 0 // STEP 01
      } else if (progress < 0.4) {
        index = 1 // STEP 02
      } else if (progress < 0.65) {
        index = 2 // STEP 03
      } else {
        index = 3 // STEP 04
      }

      setActiveStep(index)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-32 min-h-screen overflow-hidden"
    >
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Who I Am */}
          <div className="lg:sticky lg:top-32">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#3b4a52] glitch-text mb-10">
              About Jacob
            </h2>
            <p className="text-lg text-[#cbebe5] glitch-shiver leading-relaxed mb-6">
              I&apos;m Jacob, a graphic designer and creative technologist from Pilsen, focused on building immersive, brand-driven digital experiences on the web and beyond.
            </p>
            <p className="text-lg text-[#3b4a52] leading-relaxed mb-6">
              My work spans brand identity, web design, and 3D/AR experiences. I help forward-thinking brands create memorable interactions that captivate audiences and leave a lasting impression.
            </p>
            <p className="text-lg text-[#3b4a52] leading-relaxed">
              Whether it&apos;s refining a visual identity, designing a high-impact web experience, or launching a 3D/AR activation — I bring ideas to life with precision and creativity.
            </p>
          </div>

          {/* Right Column - Process Orbit */}
          <div className="lg:pl-8 flex justify-end">
            <div className="w-full max-w-[420px] lg:-mr-10">
              <h3 className="font-heading text-2xl font-semibold text-[#040b0a] mb-8">
                My Process
              </h3>
              <div className="hidden lg:block">
                <ProcessOrbit externalActiveIndex={activeStep} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
