'use client';

import React, { useEffect, useState } from 'react';
import { sdi, QualityTier } from './core';

export function SdiOverlay() {
    const [stats, setStats] = useState({ fps: 60, quality: 'HIGH' as QualityTier, dpr: 1 });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check local storage for persistent DEV overlay pref
        try {
            if (localStorage.getItem('spatial_sdi_debug') === '1') {
                setVisible(true);
            }
        } catch (e) { }

        sdi.start();
        const unsub = sdi.subscribe((quality, fps, dpr) => {
            setStats({ quality, fps, dpr });
        });

        return () => {
            unsub();
            sdi.stop();
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white font-mono text-[10px] p-2 rounded z-[100] pointer-events-none select-none border border-white/10 flex flex-col gap-1 min-w-[120px]">
            <div className="flex justify-between gap-4"><span>FPS:</span> <span className={stats.fps < 30 ? 'text-red-400' : 'text-green-400'}>{stats.fps}</span></div>
            <div className="flex justify-between gap-4"><span>TIER:</span> <span>{stats.quality}</span></div>
            <div className="flex justify-between gap-4"><span>DPR:</span> <span>{stats.dpr.toFixed(2)}</span></div>
        </div>
    );
}
