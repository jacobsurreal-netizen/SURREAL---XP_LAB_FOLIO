"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: "Nebula Commerce",
    description: "An immersive 3D e-commerce experience with AR product visualization.",
    tags: ["Web", "3D", "AR", "Spline"],
  },
  {
    title: "Quantum Brand System",
    description: "Complete brand identity and spatial design system for a tech startup.",
    tags: ["Brand", "Web", "Motion"],
  },
  {
    title: "Portal Experience",
    description: "WebXR portal experience blending physical retail with digital spaces.",
    tags: ["AR", "WebXR", "Spatial"],
  },
  {
    title: "Void Gallery",
    description: "Virtual art gallery with interactive 3D sculptures and ambient soundscapes.",
    tags: ["3D", "Web", "Audio"],
  },
  {
    title: "Pulse Dashboard",
    description: "Real-time data visualization with 3D graphics and spatial UI patterns.",
    tags: ["Web", "3D", "Data Viz"],
  },
  {
    title: "Aurora AR Campaign",
    description: "Location-based AR experience for a global fashion brand launch.",
    tags: ["AR", "Brand", "Campaign"],
  },
]

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
}

function ProjectCard({ title, description, tags }: ProjectCardProps) {
  return (
    <article className="group flex-shrink-0 w-[320px] md:w-[380px] rounded-2xl overflow-hidden bg-[#081216] border border-[#40ebff]/10 hover:border-[#40ebff]/30 transition-all duration-300">
      {/* Thumbnail Placeholder */}
      <div className="aspect-video relative overflow-hidden bg-[#0a1a1f]">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Triangle motif */}
          <svg
            className="w-16 h-16 group-hover:scale-110 transition-transform duration-500"
            viewBox="0 0 100 100"
            fill="none"
          >
            <polygon
              points="50,15 85,80 15,80"
              stroke="rgba(64, 235, 255, 0.3)"
              strokeWidth="1"
              fill="rgba(64, 235, 255, 0.05)"
              className="group-hover:fill-[rgba(64,235,255,0.1)] transition-all duration-500"
            />
          </svg>
          <div className="absolute w-10 h-10 bg-[#40ebff]/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-[#cbebe5] mb-2 group-hover:text-[#40ebff] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#cbebe5]/70 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={tag}
              className={`text-xs px-3 py-1 rounded-full border ${
                index % 2 === 0
                  ? "border-[#00d15b]/50 text-[#00d15b]"
                  : "border-[#40ebff]/50 text-[#40ebff]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function ProjectsSection() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return
    const scrollAmount = 400
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section
  id="projects"
  className="relative py-32 overflow-hidden"
>

      {/* Subtle cyan glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(64, 235, 255, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2
  className="font-heading text-4xl md:text-5xl font-bold text-[#cbebe5] mb-4 glitch-text glitch-shiver"
  data-text="Selected Projects"
  >
  Selected Projects
</h2>

<p
  className="text-lg text-[#cbebe5]/70 max-w-xl glitch-text glitch-alt"
  data-text="A curated selection of spatial web, AR, and brand systems."
  >
  A curated selection of web design, AR, and brand systems.
</p>

          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3 mt-6 md:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="bg-transparent w-12 h-12 rounded-full border-[#40ebff]/50 text-[#cbebe5] hover:bg-[#40ebff]/10 hover:border-[#40ebff] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="bg-transparent w-12 h-12 rounded-full border-[#40ebff]/50 text-[#cbebe5] hover:bg-[#40ebff]/10 hover:border-[#40ebff] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Projects Carousel */}
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {projects.map((project) => (
            <div key={project.title} className="snap-start">
              <ProjectCard
                title={project.title}
                description={project.description}
                tags={project.tags}
              />
            </div>
          ))}
        </div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === 0 ? "bg-[#40ebff]" : "bg-[#40ebff]/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
