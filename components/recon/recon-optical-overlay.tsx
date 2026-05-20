"use client"

/**
 * Non-interactive tactical lens overlay for /recon.
 * Sits above Three (z-10) and below ReconHUD (z-30).
 */
export function ReconOpticalOverlay() {
  return (
    <>
      <style>{`
        @keyframes recon-optical-sweep {
          0% {
            transform: translateY(-30vh);
          }
          100% {
            transform: translateY(130vh);
          }
        }

        .recon-optical-sweep {
          animation: recon-optical-sweep 15s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .recon-optical-sweep {
            animation: none;
            transform: translateY(35vh);
            opacity: 0.03;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        aria-hidden="true"
      >
        {/* Vignette — edge darkening */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.45) 100%)",
            opacity: 0.55,
          }}
        />

        {/* Faint optical noise — CSS gradients only */}
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: 0.05,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(64, 235, 255, 0.055) 2px,
                rgba(64, 235, 255, 0.055) 3px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 3px,
                rgba(255, 255, 255, 0.03) 3px,
                rgba(255, 255, 255, 0.03) 4px
              ),
              radial-gradient(
                circle at 20% 30%,
                rgba(64, 235, 255, 0.08) 0%,
                transparent 45%
              ),
              radial-gradient(
                circle at 80% 70%,
                rgba(64, 235, 255, 0.06) 0%,
                transparent 40%
              )
            `,
          }}
        />

        {/* Scanline texture */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.042,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(64, 235, 255, 0.14) 2px, rgba(64, 235, 255, 0.14) 4px)",
          }}
        />

        {/* Horizontal scan sweep — full width, vh-based travel */}
        <div className="recon-optical-sweep absolute left-0 right-0 top-0 h-[22vh] w-full">
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(64, 235, 255, 0.04) 18%, rgba(64, 235, 255, 0.09) 48%, rgba(64, 235, 255, 0.09) 52%, rgba(64, 235, 255, 0.04) 82%, transparent 100%)",
              opacity: 0.52,
            }}
          />
        </div>

        {/* Subtle center lens ring */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.065,
            background:
              "radial-gradient(circle at 50% 50%, transparent 56%, rgba(64, 235, 255, 0.18) 70%, rgba(64, 235, 255, 0.08) 76%, transparent 82%)",
          }}
        />
      </div>
    </>
  )
}
