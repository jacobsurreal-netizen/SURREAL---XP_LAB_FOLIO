'use client';

import React from 'react';
import { useSpatialState } from '../runtime/core';

export function ThreeRuntimeAdapter() {
    const spatialState = useSpatialState();

    // STUB: Later this will dynamically load @react-three/fiber 
    // and map `spatialState` down to 3D graph interactions.

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 border-2 border-dashed border-zinc-800 text-zinc-600">
            <p className="font-mono text-sm">ThreeRuntimeAdapter [STUB]</p>
            <p className="font-mono text-xs opacity-50 mt-2">State: {spatialState}</p>
        </div>
    );
}
