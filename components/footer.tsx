export function Footer() {
  return (
    <footer className="bg-[#040b0a] border-t border-[#40ebff]/20">
      <div className="max-w-[1320px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#cbebe5]/60">
          © {new Date().getFullYear()} Jacob Surreal. All rights reserved.
        </p>
        <p
        className="text-xs text-[#cbebe5]/40 glitch-text glitch-flip"
        data-text="Crafted with 3D, AR & a bit of cosmic dust."
        >
        Crafted with 3D, AR &amp; a bit of cosmic dust.
        </p>

      </div>
    </footer>
  )
}
