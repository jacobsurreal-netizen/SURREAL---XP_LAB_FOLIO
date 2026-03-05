import { useSyncExternalStore } from 'react';

export type GlobalQuality = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GlobalState {
    irModeEnabled: boolean;
    qualityTier: GlobalQuality;
}

class StateStore {
    private state: GlobalState = {
        irModeEnabled: false,
        qualityTier: 'HIGH'
    };

    private listeners = new Set<() => void>();

    public getState() {
        return this.state;
    }

    public setState(updates: Partial<GlobalState>) {
        this.state = { ...this.state, ...updates };
        this.listeners.forEach(listener => listener());
    }

    public subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };
}

export const globalStateStore = new StateStore();

export function useGlobalState() {
    return useSyncExternalStore(
        globalStateStore.subscribe,
        () => globalStateStore.getState(),
        () => globalStateStore.getState()
    );
}
