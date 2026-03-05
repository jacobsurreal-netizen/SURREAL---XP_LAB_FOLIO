'use client';

import React from 'react';
import { useSpatialState } from '../runtime/core';

export function SplineRuntimeAdapter() {
    const spatialState = useSpatialState();

    // STUB: Later this will dynamically load @splinetool/react-spline 
    // and map `spatialState` down to scene graph interactions.

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border-2 border-dashed border-zinc-700 text-zinc-500">
            <p className="font-mono text-sm">SplineRuntimeAdapter [STUB]</p>
            <p className="font-mono text-xs opacity-50 mt-2">State: {spatialState}</p>
        </div>
    );
}
