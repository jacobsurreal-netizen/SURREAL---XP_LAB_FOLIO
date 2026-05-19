"use client"

import React from "react"

export function ReconMobileGateway() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-teal-300"
      style={{ minHeight: "100dvh", minWidth: "100vw" }}
    >
      <div className="font-mono text-xs tracking-widest mb-4 opacity-80 select-none">
        DIAGNOSTIC PROBE
      </div>
      <div className="font-mono text-lg tracking-widest mb-8 select-none">
        MOBILE SCANNER READY
      </div>
      <button
        className="px-6 py-3 rounded bg-teal-400 text-black font-bold tracking-widest text-sm shadow-lg hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200"
        style={{ letterSpacing: "0.2em" }}
        onClick={() => { window.location.href = "/recon/ar" }}
      >
        ACTIVATE SCANNER
      </button>
    </div>
  )
}
