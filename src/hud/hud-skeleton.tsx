'use client';

import React, { useState, useEffect } from 'react';

// HUD layer needs high index to always overlay the scene
const HUD_Z_INDEX = 50;

export function HudSkeleton({ children }: { children?: React.ReactNode }) {
    const [irMode, setIrMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Persistence of IR mode (Infrared / Debug view)
    useEffect(() => {
        setMounted(true);
        try {
            const persisted = localStorage.getItem('spatial_ir_mode');
            if (persisted === '1') {
                setIrMode(true);
            }
        } catch (e) { /* ignore localStorage issues */ }
    }, []);

    const toggleIrMode = () => {
        setIrMode(prev => {
            const next = !prev;
            try {
                localStorage.setItem('spatial_ir_mode', next ? '1' : '0');
            } catch (e) { }
            return next;
        });
    };

    // Do not render localStorage bound conditionals until mounted to prevent hydration errors
    if (!mounted) return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: HUD_Z_INDEX }}
        >
            {/* 
        Container for actual HUD elements. Pointer-events are disabled on the wrapper
        but must be re-enabled on interactive parts.
      */}
            <div className="absolute top-4 right-4 pointer-events-auto">
                <button
                    onClick={toggleIrMode}
                    className="text-xs font-mono uppercase border border-current px-2 py-1 rounded bg-black/50 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
                >
                    {irMode ? 'IR: ON' : 'IR: OFF'}
                </button>
            </div>

            {irMode && (
                <div className="absolute inset-0 border-4 border-green-500/20 pointer-events-none mix-blend-screen" />
            )}

            {children}
        </div>
    );
}
