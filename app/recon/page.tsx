import { ReconShell } from "@/components/recon/recon-shell"

export default function ReconPage() {
  return (
    <ReconShell reverseCameraProgress>
      {/* Scroll canvas spacer for 3-sector flow */}
      <div aria-hidden="true" className="h-[300svh]" />
    </ReconShell>
  )
}
