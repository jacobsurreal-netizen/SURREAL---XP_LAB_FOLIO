export type SpatialEvent =
    | 'NAV_NODE_VISIBLE'
    | 'NAV_NODE_ENTER'
    | 'NAV_NODE_EXIT'
    | 'PORTAL_ACTIVATED'
    | 'NAVIGATION_RESET'
    | 'HUD_TOGGLE_IR'
    | 'SDI_QUALITY_CHANGED';

export interface SpatialEventPayloads {
    NAV_NODE_VISIBLE: { nodeId: string };
    NAV_NODE_ENTER: { nodeId: string };
    NAV_NODE_EXIT: { nodeId: string };
    PORTAL_ACTIVATED: { portalId: string; destination: string };
    NAVIGATION_RESET: void;
    HUD_TOGGLE_IR: { isEnabled: boolean };
    SDI_QUALITY_CHANGED: { previous: string; current: string };
}
