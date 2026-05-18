"use client"

const RECON_AR_URL = "/recon/ar"

interface ReconQrModalProps {
    open: boolean
    onClose: () => void
}

export function ReconQrModal({ open, onClose }: ReconQrModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
            <div className="w-full max-w-md border border-cyan-300/30 bg-black/90 p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                <div className="mb-6 font-mono text-xs tracking-[0.25em] text-cyan-200/80">
                    [ TRANSFER SESSION TO MOBILE PROBE ]
                </div>

                <div className="mb-6 flex aspect-square w-full items-center justify-center border border-cyan-300/25 bg-cyan-300/5">
                    <div className="text-center font-mono text-xs tracking-[0.3em] text-cyan-100/60">
                        QR LINK PENDING
                    </div>
                </div>

                <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-cyan-100/70">
                    SCAN TO CONTINUE RECON PROCEDURE
                </p>

                <div className="flex items-center justify-between gap-4">
                    <a
                        href={RECON_AR_URL}
                        className="pointer-events-auto border border-cyan-300/40 px-4 py-2 font-mono text-xs tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/10"
                    >
                        OPEN MOBILE SCANNER
                    </a>

                    <button
                        type="button"
                        onClick={onClose}
                        className="pointer-events-auto border border-cyan-300/20 px-4 py-2 font-mono text-xs tracking-[0.18em] text-cyan-100/70 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                    >
                        [ CLOSE ]
                    </button>
                </div>
            </div>
        </div>
    )
}