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
        index = 0
      } else if (progress < 0.4) {
        index = 1
      } else if (progress < 0.65) {
        index = 2
      } else {
        index = 3
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
      className="relative min-h-[150svh] py-40 overflow-hidden"
    >
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left Column - Who I Am */}
          <div className="lg:sticky lg:top-32">
            {/* DISCONNECTED: About Jacob glitch title */}
            {/*
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#3b4a52] glitch-text mb-10">
              About Jacob
            </h2>
            */}
            {/* DISCONNECTED: About paragraph content */}
            {/*
            <p className="text-lg text-[#cbebe5] glitch-shiver leading-relaxed mb-6">
              I&apos;m Jacob, a graphic designer and creative technologist from Pilsen, focused on building immersive, brand-driven digital experiences on the web and beyond.
            </p>
            <p className="text-lg text-[#3b4a52] leading-relaxed mb-6">
              My work spans brand identity, web design, and 3D/AR experiences. I help forward-thinking brands create memorable interactions that captivate audiences and leave a lasting impression.
            </p>
            <p className="text-lg text-[#3b4a52] leading-relaxed">
              Whether it&apos;s refining a visual identity, designing a high-impact web experience, or launching a 3D/AR activation — I bring ideas to life with precision and creativity.
            </p>
            */}
          </div>

          {/* Right Column - Process Orbit */}
          <div className="lg:pl-12 flex justify-end">
            <div className="w-full max-w-[420px] lg:-mr-10">
              {/* DISCONNECTED: My Process and ProcessOrbit */}
              {/*
              <h3 className="font-heading text-2xl font-semibold text-[#040b0a] mb-8">
                My Process
              </h3>
              <div className="hidden lg:block">
                <ProcessOrbit externalActiveIndex={activeStep} />
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}