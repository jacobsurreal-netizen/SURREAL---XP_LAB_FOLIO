"use client"

import { Button } from "@/components/ui/button"
import { Mail, Linkedin, Instagram, Github, Youtube } from "lucide-react"
import Link from "next/link"

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Youtube, href: "#", label: "Youtube" },
]

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-32"
      style={{
        background:
          "linear-gradient(180deg, #0d1f1c 0%, #040b0a 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(64, 235, 255, 0.25) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <h2
        className="font-heading text-4xl md:text-5xl font-bold text-[#cbebe5] mb-6 glitch-text glitch-strobe"
        data-text="Let's Create Something"
        >
        Tell Me About Your Vision
        </h2>


        <p className="text-lg text-[#cbebe5]/80 mb-10">
          Ready to bring your vision to life through brand‑driven web, 3D experiences, or AR activations? Let&apos;s create something unforgettable together.
        </p>

        {/* Email CTA */}
        <div className="mb-10">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-6 bg-[#40ebff] text-[#040b0a] hover:bg-[#3ab7d4] transition-colors shadow-[0_0_25px_rgba(64,235,255,0.4)]"
          >
            <Link href="mailto:hello@jacobsurreal.com">
              <Mail className="w-5 h-5 mr-2" />
              hello@jacobsurreal.com
            </Link>
          </Button>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="w-10 h-10 rounded-full border border-[#40ebff]/40 text-[#cbebe5] flex items-center justify-center hover:bg-[#40ebff]/15 hover:border-[#40ebff] transition-colors"
            >
              <social.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
