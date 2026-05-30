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

        @keyframes recon-optical-breathe {
          0%,
          100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.085;
          }
        }

        .recon-optical-breathe {
          animation: recon-optical-breathe 9s ease-in-out infinite;
        }

        /* Gentle pointer parallax on the lens ring so the optical layer tracks   */
        /* the observer along with the HUD (reads parallax vars from the shell).  */
        .recon-optical-parallax {
          transform: translate3d(calc(var(--recon-parallax-x, 0) * 3px), calc(var(--recon-parallax-y, 0) * 3px), 0);
          transition: transform 240ms ease-out;
        }

        @media (max-width: 767px) {
          .recon-optical-sweep {
            display: none;
            animation: none;
          }

          .recon-optical-noise {
            display: none;
          }

          .recon-optical-scanlines {
            opacity: 0.025 !important;
          }

          .recon-optical-breathe {
            animation: none;
            opacity: 0.045 !important;
          }

          .recon-optical-parallax {
            transform: none;
            transition: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .recon-optical-sweep {
            animation: none;
            transform: translateY(35vh);
            opacity: 0.03;
          }

          .recon-optical-breathe {
            animation: none;
            opacity: 0.065;
          }

          .recon-optical-parallax {
            transform: none;
            transition: none;
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
          className="recon-optical-noise absolute inset-0 mix-blend-soft-light"
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
          className="recon-optical-scanlines absolute inset-0"
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

        {/* Subtle center lens ring — gentle signal breathe for HUD cohesion */}
        <div
          className="recon-optical-breathe recon-optical-parallax absolute inset-0"
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
