# SURREAL TEMPLATE KIT ROADMAP

## v0.1 → v0.4

Author: Jacob Surreal\
System: SURREAL Spatial Web Template Kit\
Purpose: Define the staged evolution of the template kit from runtime
foundation to production‑ready spatial web framework.

------------------------------------------------------------------------

# Overview

The roadmap defines four development stages:

  ------------------------------------------------------------------------
  Version             Focus            Description
  ------------------- ---------------- -----------------------------------
  v0.1                Foundation       Verified Three.js + Next.js runtime
                      Runtime          shell

  v0.2                Asset Runtime    GLB loading pipeline and scene
                                       asset management

  v0.3                Experience State Navigation, interaction and state
                      Layer            orchestration

  v0.4                Production       Shaders, atmosphere, motion design
                      Polish           and performance
  ------------------------------------------------------------------------

Each stage should be implemented through **feature branches**, merged
into `main` only when stable.

------------------------------------------------------------------------

# v0.1 --- Foundation Runtime

Status: **Completed**

## Purpose

Create a stable spatial runtime foundation.

## Achievements

-   Next.js application runs successfully
-   Three.js renderer integrated with React lifecycle
-   `ThreeRuntimeAdapter` scene runtime created
-   Canvas mounting and resize handling verified
-   Animation loop functioning
-   HUD layer isolated from renderer
-   Torus smoke test rendering correctly
-   TypeScript passes validation
-   Production build successful

## Validation Commands

``` bash
pnpm build
pnpm dev
pnpm exec tsc --noEmit
```

Expected outcome:

-   No build errors
-   No TypeScript errors
-   Rotating torus visible in viewport

## Git Milestone

``` bash
git add .
git commit -m "SPATIAL TEMPLATE v0.1 — foundation runtime"
git push
git tag spatial-template-v0.1
git push origin spatial-template-v0.1
```

Create stable template branch:

``` bash
git branch template-shell
git push origin template-shell
```

------------------------------------------------------------------------

# v0.2 --- Asset Runtime

Purpose: Introduce **3D asset loading and scene anchoring**.

## Phase 2.1 --- GLB Loader

Branch:

    feature/glb-loader

Goal:

Load `.glb` models using `GLTFLoader` and replace the torus smoke test.

Success Criteria:

-   GLB loads reliably
-   Scene renders asset correctly
-   No runtime errors
-   Restarting dev server does not break loader

Merge to `main` once stable.

------------------------------------------------------------------------

## Phase 2.2 --- Hero Asset System

Branch:

    feature/hero-asset

Goal:

Introduce a **single hero object** as the spatial anchor of the scene.

Recommendations:

    public/models/hero.glb

Create constant reference:

``` ts
const HERO_ASSET_PATH = "/models/hero.glb"
```

Success Criteria:

-   Asset can be swapped without architecture changes
-   Scene remains stable if asset is missing
-   Loader remains reusable

------------------------------------------------------------------------

## Phase 2.3 --- Camera Framing

Branch:

    feature/camera-framing

Goal:

Automatically position camera based on model size.

Technique:

Use `THREE.Box3()` bounding box to determine object scale.

Benefits:

-   Any reasonable model loads correctly
-   Camera does not spawn inside geometry
-   No manual camera tweaking required

------------------------------------------------------------------------

## Phase 2.4 --- Basic Light Rig

Branch:

    feature/light-rig

Goal:

Create default lighting preset for spatial scenes.

Recommended Lights:

-   Ambient light
-   Directional light
-   Optional rim light

Success Criteria:

-   Hero asset clearly visible
-   Scene lighting balanced
-   Lighting reusable across projects

------------------------------------------------------------------------

## v0.2 Completion

When all asset pipeline features are stable:

``` bash
git tag spatial-template-v0.2
git push origin spatial-template-v0.2
```

Result:

    Asset‑ready spatial template

------------------------------------------------------------------------

# v0.3 --- Experience State Layer

Purpose: Transform the template from a 3D demo into a navigable spatial
experience.

------------------------------------------------------------------------

## Phase 3.1 --- Experience States

Branch:

    feature/experience-states

Goal:

Replace page sections with experience states.

Example:

``` ts
type ExperienceState =
  | "hero"
  | "about"
  | "projects"
  | "contact"
```

Success Criteria:

Application always knows its current state.

------------------------------------------------------------------------

## Phase 3.2 --- Transitions

Branch:

    feature/transitions

Goal:

Add smooth transitions between experience states.

Examples:

-   Camera interpolation
-   Fade transitions
-   Scene emphasis

Success Criteria:

State changes feel intentional and cinematic.

------------------------------------------------------------------------

## Phase 3.3 --- Interaction Logic

Branch:

    feature/interaction-logic

Goal:

Introduce input layer.

Examples:

-   click
-   hover
-   scroll
-   keyboard navigation

Success Criteria:

Interaction can trigger experience state changes.

------------------------------------------------------------------------

## Phase 3.4 --- HUD Reintegration

Branch:

    feature/hud-system

Goal:

Reconnect HUD with scene and state system.

Requirements:

-   HUD overlays WebGL correctly
-   No interference with renderer
-   HUD reacts to experience states

------------------------------------------------------------------------

## v0.3 Completion

When navigation and state orchestration are stable:

``` bash
git tag spatial-template-v0.3
git push origin spatial-template-v0.3
```

Result:

    Navigable spatial experience template

------------------------------------------------------------------------

# v0.4 --- Production Polish

Purpose: Transform template into production‑ready spatial web system.

------------------------------------------------------------------------

## Phase 4.1 --- Shader System

Branch:

    feature/shaders

Goal:

Introduce custom materials or shader effects.

Guideline:

Shaders must serve clear visual purpose.

------------------------------------------------------------------------

## Phase 4.2 --- Atmosphere Layer

Branch:

    feature/atmosphere

Examples:

-   fog
-   subtle particles
-   background gradients

Goal:

Create environmental mood without obscuring hero asset.

------------------------------------------------------------------------

## Phase 4.3 --- Motion Design

Branch:

    feature/motion-design

Goal:

Add rhythm and cinematic movement.

Examples:

-   eased camera motion
-   idle object motion
-   UI transitions

------------------------------------------------------------------------

## Phase 4.4 --- Microinteractions

Branch:

    feature/microinteractions

Examples:

-   hover reactions
-   cursor feedback
-   subtle UI states

------------------------------------------------------------------------

## Phase 4.5 --- Performance Optimization

Branch:

    feature/performance-tuning

Focus Areas:

-   pixel ratio control
-   render guards
-   asset lazy loading
-   frame stability

------------------------------------------------------------------------

## v0.4 Completion

``` bash
git tag spatial-template-v0.4
git push origin spatial-template-v0.4
```

Result:

    Production‑ready spatial template kit

------------------------------------------------------------------------

# Development Philosophy

The template prioritizes:

    clarity
    system separation
    modular architecture
    progressive enhancement

The goal is to evolve from:

    runtime foundation
    → asset system
    → experience orchestration
    → production spatial platform

------------------------------------------------------------------------

# End of Document
