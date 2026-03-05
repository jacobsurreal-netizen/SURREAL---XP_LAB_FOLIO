import { useSyncExternalStore } from 'react';

// Define the core Spatial State Machine states
export type SpatialState =
    | 'INIT'
    | 'IDLE'
    | 'SCAN'
    | 'FOCUS'
    | 'CTA'
    | 'PORTAL_READY'
    | 'PORTAL_TRANSIT'
    | 'DEEP_LAYER'
    | 'RETURN';

// Event Bus Payload Types
export type SpatialEventPayload = {
    'STATE_CHANGE': { previous: SpatialState; current: SpatialState };
    'INTERACTION': { targetId: string; type: 'click' | 'hover' | 'scroll' };
    'SYSTEM_WARNING': { message: string; severity: 'low' | 'medium' | 'high' };
};

type EventType = keyof SpatialEventPayload;
type EventHandler<T extends EventType> = (payload: SpatialEventPayload[T]) => void;

class SpatialRuntime {
    private currentState: SpatialState = 'INIT';
    private listeners: Set<() => void> = new Set();

    // Event Bus
    private eventBus: Map<EventType, Set<EventHandler<any>>> = new Map();

    // State Machine transition
    public transitionTo(newState: SpatialState) {
        if (this.currentState === newState) return;

        const previous = this.currentState;
        this.currentState = newState;

        this.emit('STATE_CHANGE', { previous, current: newState });
        this.notify();
    }

    public getState(): SpatialState {
        return this.currentState;
    }

    // --- Event Bus Methods ---
    public on<T extends EventType>(event: T, handler: EventHandler<T>) {
        if (!this.eventBus.has(event)) {
            this.eventBus.set(event, new Set());
        }
        this.eventBus.get(event)!.add(handler);
        return () => this.off(event, handler);
    }

    public off<T extends EventType>(event: T, handler: EventHandler<T>) {
        this.eventBus.get(event)?.delete(handler);
    }

    public emit<T extends EventType>(event: T, payload: SpatialEventPayload[T]) {
        this.eventBus.get(event)?.forEach(handler => handler(payload));
    }

    // --- React useSyncExternalStore integration ---
    public subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    public getSnapshot = () => {
        // Must return a stable reference for primitive types like strings
        return this.currentState;
    };

    private notify() {
        this.listeners.forEach(listener => listener());
    }
}

// Singleton instance
export const spatialRuntime = new SpatialRuntime();

// React Hook
export function useSpatialState() {
    return useSyncExternalStore(spatialRuntime.subscribe, spatialRuntime.getSnapshot, spatialRuntime.getSnapshot);
}
