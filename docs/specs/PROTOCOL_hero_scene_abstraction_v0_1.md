# PROTOCOL — Hero Scene Abstraction v0.1

## Purpose
Prepare the runtime for a future hero scene upgrade without requiring rewrites of the HUD, camera orchestration, mode system, or navigation logic.

## Context
v1 uses a stable placeholder scene and artifact.

v2 plans a cinematic scene shell with:
- a new hero object
- pedestal / base
- fog layer
- volumetric beam lighting
- additional environment elements

## Goal
Separate:
- the hero asset
- the scene variant
- spectrum modes

So that:
- the template-kit can swap only the asset
- the folio runtime can swap the entire scene preset
- SCAN / IR / COLOR remain fully compatible

## Architectural Rules
1. Do not merge asset swap and scene swap
2. Mode system stays above the scene
3. Camera / HUD / Event Bus stay asset-agnostic
4. Scene variant = recipe

## Future Types
```ts
type HeroAssetVariant =
  | "tetra-orb-v1"
  | "penrose-v2"
  | "custom"

type HeroSceneVariant =
  | "placeholder-stage"
  | "cinematic-chamber-v2"
```

## Recipe Model
```ts
interface HeroSceneRecipe {
  assetVariant: HeroAssetVariant
  pedestal: boolean
  fogLayer: boolean
  volumetricBeam: boolean
  satelliteNodes: boolean
  interactionProfile: "minimal" | "cinematic"
  scanProfile: "technical" | "cinematic-analysis"
}
```

## Implementation Timing
Implement only after:
- SCAN craft completion
- stable shared mode behavior
- optional sound hook foundation

## Note for Future Self
First stability.
Then elegance.
Then revelation.

v1 must ship stable.
v2 should arrive as a world that already knows what it wants to become.
