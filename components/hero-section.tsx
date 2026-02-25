"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-24"
      style={{ position: "relative" }}
    >
      
      {/* Animated Triangle Background Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px]">
          {/* Outer rotating triangle */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,15 185,170 15,170"
              stroke="rgba(64, 235, 255, 0.15)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          {/* Middle rotating triangle (opposite direction) */}
          <svg
            className="absolute inset-0 w-full h-full animate-[spin_25s_linear_infinite_reverse] scale-75"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,15 185,170 15,170"
              stroke="rgba(64, 235, 255, 0.2)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          {/* Inner pulsing triangle */}
          <svg
            className="absolute inset-0 w-full h-full animate-pulse scale-40"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,15 185,170 15,170"
              stroke="rgba(64, 235, 255, 0.3)"
              strokeWidth="1.5"
              fill="rgba(64, 235, 255, 0.03)"
            />
          </svg>

          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-32 h-32 bg-[#40ebff]/5 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-6 flex flex-col items-center justify-center">
        {/* PNG Logo */}
        <div className="mb-4 md:mb-6">
          <Image
            src="/images/chatgpt-20image-2022.png"
            alt="Jacob Surreal Logo"
            width={400}
            height={150}
            className="w-[280px] md:w-[350px] lg:w-[400px] h-auto invert"
            priority
          />
        </div>

        {/* Brand Subtitle */}
        <p 
        className="font-heading text-sm md:text-base lg:text-lg font-medium tracking-[0.3em] text-[#cbebe5]/80 uppercase text-center mb-12 md:mb-16 glitch-subtle glitch-alt glitch-strobe glitch-flip"
          data-text="BRAND, WEB & AR"
        >
          BRAND, WEB & AR
        </p>


        {/* 3D Hero Block Placeholder */}
        <div className="relative w-full max-w-4xl mx-auto aspect-video mb-12 rounded-2xl overflow-hidden border border-primary/20 bg-[#081216]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Animated 3D placeholder */}
            <div className="relative">
              <div
                className="w-40 h-40 md:w-56 md:h-56 border border-primary/30 rounded-lg transform rotate-45 animate-spin"
                style={{ animationDuration: "20s" }}
              >
                <div className="absolute inset-4 border border-primary/50 rounded-lg" />
                <div className="absolute inset-8 border border-primary/70 rounded-lg" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-full box-glow animate-pulse" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-left">
            <span className="text-xs text-muted-foreground font-mono">
              // Spatial Experience Preview
            </span>
          </div>
        </div>

        {/* Claim */}
        <p 
        className="font-sans text-lg md:text-xl lg:text-2xl text-[#cbebe5] text-center mb-10 md:mb-12 glitch-text glitch-alt glitch-malfunction"
        data-text="Crafting impossible 3D, web, and AR experiences."
        >
         Crafting unforgettable experiences in the digital realm.
        </p>


        {/* CTA Button */}
        <Link href="#contact">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent rounded-full px-8 py-6 text-base border-[#40ebff] text-[#cbebe5] hover:bg-[#40ebff]/10 hover:shadow-[0_0_20px_rgba(64,235,255,0.3)] transition-all duration-300"
          >
            Get in Touch
          </Button>
        </Link>
      </div>
    </section>
  )
}
