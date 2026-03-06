'use client';

import React from 'react';

/*
  TEMPORARY SMOKE TEST MODE

  HUD rendering is disabled to isolate the Three.js runtime.
  This keeps the component in the tree but bypasses all HUD logic.

  To restore HUD later:
  revert this file or re-enable the original implementation.
*/

export function HudSkeleton({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}