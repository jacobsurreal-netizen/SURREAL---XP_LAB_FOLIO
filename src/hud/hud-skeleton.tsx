'use client';

import React from 'react';
import { HudParallax, HUD_MODES } from './index';
import { useSpectrumMode } from "@/hooks/use-spectrum-mode";

export function HudSkeleton({ children }: { children?: React.ReactNode }) {
  const { mode } = useSpectrumMode();

  const hudMode = mode === 'IR' ? HUD_MODES.IR : HUD_MODES.NORMAL;

  return (
    <>
      {children}

      <div className="pointer-events-none fixed inset-0 z-30">
        <HudParallax mode={hudMode} />
      </div>
    </>
  );
}