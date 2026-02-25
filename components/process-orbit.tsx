"use client"

import { useEffect, useRef, useState } from "react"

const processSteps = [
  {
    number: "01",
    title: "Discovery",
    description: "Understanding your vision and goals.",
  },
  {
    number: "02",
    title: "Concept",
    description: "Crafting the creative direction.",
  },
  {
    number: "03",
    title: "Brand & Web",
    description: "Immersive brand-driven web experiences.",
  },
  {
    number: "04",
    title: "3D/AR Activation",
    description: "Bringing experiences to life.",
  },
]

type ProcessOrbitProps = {
  externalActiveIndex?: number
}

export function ProcessOrbit({ externalActiveIndex }: ProcessOrbitProps) {
  const [activeIndex, setActiveIndex] = useState(0)

const cardPositions = [
  { top: "-top-20", right: "right-[60px]" },   // STEP 01
  { top: "top-5", right: "right-[150px]" },  // STEP 02
  { top: "top-50", right: "right-[170px]" },  // STEP 03
  { top: "top-80", right: "right-[100px]" },  // STEP 04
]


  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // sync se scroll indexem z AboutSection – jen nastavuje activeIndex, geometrie zůstává tvoje
  useEffect(() => {
    if (typeof externalActiveIndex === "number") {
      setActiveIndex(externalActiveIndex)
    }
  }, [externalActiveIndex])

  // Scroll kolečkem mění aktivní krok (jen nad sliderem)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY > 0 ? 1 : -1
      setActiveIndex((prev) => {
        const next = prev + direction
        if (next < 0) return processSteps.length - 1
        if (next >= processSteps.length) return 0
        return next
      })
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, []) 


  return (
    <div
      ref={containerRef}
      className="pointer-events-auto"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Orbit (radar) napravo */}
      <div className="relative h-[420px]">
        <div className="absolute inset-y-0 right-[-225px] flex items-center justify-center">
          <div className="relative w-[320px] h-[320px] cyber-glow glitch-hud">
            {/* Rotující HUD kruhy */}
            <div className="absolute inset-0">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-[#40ebff]/60"
              >
                {/* Vnější kruh – pomalá rotace doprava */}
                <g className="hud-ring hud-ring-slow">
                  <circle
                    cx="100"
                    cy="100"
                    r="86"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 10"
                  />
                </g>

                {/* Střední kruh – rychlejší rotace doleva */}
                <g className="hud-ring hud-ring-medium">
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="8 12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 8"
                  />
                </g>

                {/* Vnitřní kruh – jemná rotace doprava */}
                <g className="hud-ring hud-ring-fast">
                  <circle
                    cx="100"
                    cy="100"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="10 18"
                  />
                </g>

                {/* Malé značky / tečky */}
                <g className="hud-ring hud-ring-medium">
                  <circle cx="160" cy="100" r="2" fill="currentColor" />
                  <circle cx="40" cy="100" r="2" fill="currentColor" />
                  <circle cx="100" cy="40" r="2" fill="currentColor" />
                  <circle cx="100" cy="160" r="2" fill="currentColor" />
                </g>

                {/* Sweep oblouk – radarový průlet */}
                <g className="hud-sweep">
                  <path
                    d="M 100 26 A 74 74 0 0 1 174 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            {/* Body na orbitě s čísly – TVÉ hodnoty zachované */}
            {processSteps.map((step, index) => {
              const total = processSteps.length
              const angle =
                (-90 + (170 / (total - 1 || 1)) * index) * (Math.PI / 200)
              const radius = 155
              const x = 135 + radius * Math.cos(angle)
              const y = 160 + radius * Math.sin(angle)

              const isActive = index === activeIndex

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none pointer-events-auto"
                  style={{ right: `${x}px`, top: `${y}px` }}
                  aria-label={step.title}
                >
                  <span
                    className={`flex items-center justify-center rounded-full border text-xs font-heading font-semibold transition-all duration-300 ${
                      isActive
                        ? "w-9 h-9 border-[#40ebff] bg-[#40ebff]/20 text-[#040b0a] shadow-[0_0_20px_rgba(64,235,255,0.6)] hud-dot-glitch"
                        : "w-7 h-7 border-[#40ebff]/40 bg-[#040b0a] text-[#40ebff]/70"
                    }`}
                  >
                    {index + 1}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel s aktivní kartou vlevo nahoře od radaru */}
        {(() => {
        const pos = cardPositions[activeIndex] ?? cardPositions[0]

        return ( 
        <div
           className={`absolute ${pos.top} ${pos.right} transition-all duration-500 pointer-events-none ${
           expanded ? "opacity-100 translate-y-2" : "opacity-0 translate-y-4"
           }`}
          >

          <div className="w-[200px] rounded-2xl border border-[#040b0a]/20 bg-white/90 backdrop-blur px-5 py-4 shadow-[0_12px_40px_rgba(4,11,10,0.45)] pointer-events-auto">
            <p className="text-xs font-mono tracking-[0.25em] text-[#7a9a94] mb-2">
              STEP {processSteps[activeIndex].number}
            </p>
            <h4 className="font-heading text-lg font-semibold text-[#040b0a] mb-1">
              {processSteps[activeIndex].title}
            </h4>
            <p className="text-sm text-[#3b4a52]">
              {processSteps[activeIndex].description}
            </p>
          </div>
        </div>
        )
})()}
      </div>
    </div>
  )
}
