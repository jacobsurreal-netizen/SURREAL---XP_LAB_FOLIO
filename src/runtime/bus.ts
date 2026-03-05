import { SpatialEvent, SpatialEventPayloads } from './events';

type Callback<T extends SpatialEvent> = (payload: SpatialEventPayloads[T]) => void;

class EventBus {
    private listeners: Map<SpatialEvent, Set<Callback<any>>> = new Map();

    public subscribe<T extends SpatialEvent>(event: T, callback: Callback<T>) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        return () => this.unsubscribe(event, callback);
    }

    public unsubscribe<T extends SpatialEvent>(event: T, callback: Callback<T>) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    public emit<T extends SpatialEvent>(event: T, payload: SpatialEventPayloads[T]) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(cb => cb(payload));
        }
    }
}

export const bus = new EventBus();
