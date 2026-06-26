# ARCH_004 — Runtime Ownership Manifest

Status: Current implementation after Safe Refactor R1–R7  
Project: SURREAL_XP_LAB_FOLIO / SURREAL EXP LAB  
Purpose: Define runtime ownership boundaries so future work does not reintroduce hidden mounts, duplicated state ownership, or layer leakage.

---

## 1. Core Rule

The project follows a shell-owned spatial runtime model.

```txt
app/layout.tsx
  → framework root only

app/page.tsx
  → route entrypoint only

components/SystemShell
  → runtime orchestration owner
```

No runtime, HUD, SDI, Three.js, overlay, or spatial experience layer should be mounted directly from `layout.tsx`.

---

## 2. Root Layout Ownership

File:

```txt
app/layout.tsx
```

### Owns

- global fonts
- global CSS import
- metadata
- providers
- route children
- Vercel analytics

### Must NOT own

- Three.js runtime
- HUD runtime
- reticle system
- parallax HUD
- SDI overlay
- spectrum overlays
- SCAN / IR visual layers
- camera system
- scroll runtime

### Current expected structure

```tsx
<body>
  <Providers>{children}</Providers>
  <Analytics />
</body>
```

---

## 3. Page Entrypoint Ownership

File:

```txt
app/page.tsx
```

### Owns

- route composition
- page section ordering
- scroll content children passed into SystemShell

### Must NOT own

- ThreeRuntimeAdapter directly
- HudSkeleton directly
- SdiOverlay directly
- runtime orchestration logic

### Expected structure

```tsx
<SystemShell>
  <HeroSection />
  <AboutSection />
  <ProjectsSection />
</SystemShell>
```

---

## 4. SystemShell Ownership

File:

```txt
components/system-shell.tsx
```

`SystemShell` is the runtime orchestration owner.

### Owns

- scroll / sector state bridge
- smoothed progress
- spectrum mode orchestration
- keyboard controls
- HUD opacity / inactivity behavior
- language bridge
- world layer mount
- Three runtime mount
- HUD layer mount
- HudSkeleton runtime bridge
- IR / SCAN overlays
- SDI diagnostic overlay
- scrollable content wrapper

### Layer model

```txt
Layer 0   WorldLayer
Layer 10  ThreeRuntimeAdapter + CameraDebugHUD
Layer 20  IR / SCAN visual overlays
Layer 30  HUDLayer
Layer 35  HudSkeleton runtime bridge
Layer 90  SdiOverlay diagnostic layer
Layer 100 Scrollable content
```

### Notes

`SystemShell` is currently the single runtime owner.  
It may still be internally dense, but ownership is now centralized and intentional.

---

## 5. WorldLayer Ownership

File:

```txt
components/world-layer.tsx
```

### Owns

- world/background visual foundation
- environmental visual layer
- non-Three structural background
- mode-aware visual styling passed from SystemShell

### Must NOT own

- Three.js renderer
- camera lifecycle
- HUD logic
- SDI logic
- global spectrum state

---

## 6. Three Runtime Ownership

File:

```txt
src/scene/three-adapter.tsx
```

`ThreeRuntimeAdapter` is the render kernel.

### Owns

- Three.js scene
- camera
- renderer
- postprocessing composer
- fog
- light rig
- hero asset attachment
- camera framing
- OrbitController instance
- animation loop
- render phase
- update phase
- spectrum application to Three scene assets

### Must NOT own

- root layout
- page layout
- HUD UI composition
- SDI policy decisions
- content sections
- business/content layer

### Current internal structure after R7

```txt
ThreeRuntimeAdapter
  → scene/bootstrap setup
  → hero asset async attach
  → camera framing + orbit controller
  → pointer input via pointer-tracker
  → updatePhase()
  → renderPhase()
  → cleanup
```

### Extracted module

```txt
src/scene/input/pointer-tracker.ts
```

Owns:

- pointer position
- pointer smoothing
- mousemove listener
- mouseleave reset
- input cleanup

---

## 7. Camera / Orbit Ownership

Files:

```txt
src/scene/camera/framing.ts
src/scene/camera/orbit-controller.ts
src/scene/camera/scroll-camera-bridge.ts
src/scene/camera/sector-camera-poses.ts
```

### Owns

- object framing
- orbit controller behavior
- snapshot-to-orbit mapping
- sector camera pose logic

### Must NOT own

- React state
- HUD rendering
- layout
- DOM hierarchy

These modules are considered stable and should not be rewritten unless camera behavior is intentionally being changed.

---

## 8. Hero Asset Ownership

File:

```txt
src/scene/objects/create-hero-asset.ts
```

### Owns

- hero asset creation
- asset-level effects
- hero update hooks
- spectrum response hooks attached to asset userData

### Status

Active, but a future cleanup candidate.

Potential future split:

```txt
createHeroAsset
createHeroParticles
createHeroGlow
applyHeroSpectrumMode
```

No split has been performed yet.

---

## 9. HUD Ownership

HUD is split into two active layers:

```txt
HUDLayer
HudSkeleton
```

Both are currently owned by `SystemShell`.

### 9.1 HUDLayer

File:

```txt
components/hud-layer.tsx
```

### Owns

- HUD interface layer
- sector navigation
- telemetry-style HUD content
- microcopy integration
- spectrum controls
- user-facing HUD composition

### Receives

- progress
- sector
- sectorIndex
- goToSector
- spectrumMode
- onToggleSpectrum
- language state
- translation function

### Important rule

`HUDLayer` receives spectrum mode from `SystemShell`.  
It must not become a new spectrum source of truth.

### 9.2 HudSkeleton

File:

```txt
src/hud/hud-skeleton.tsx
```

### Owns

- parallax HUD runtime layer
- reticle controller mount
- HUD runtime bridge wrapper

### Receives

- `mode` from `SystemShell`

### Important refactor result

Before R4:

```txt
HudSkeleton → useSpectrumMode()
```

After R4:

```txt
SystemShell → HudSkeleton(mode)
```

This means `HudSkeleton` is now a controlled runtime child, not an independent mode owner.

### 9.3 Reticle System

Files:

```txt
src/hud/reticle/*
src/hud/reticle/hooks/useReticleState.ts
```

### Owns

- reticle state resolution
- reticle presentation
- reticle layers
- mode-aware reticle behavior
- pointer/parallax motion response

### Important refactor result

Before R4.5:

```txt
useReticleState → useSpectrumMode()
```

After R4.5:

```txt
HudSkeleton / HUDLayer → useReticleState(mode)
```

The reticle no longer reads global spectrum mode directly.

### 9.4 HudParallax

File:

```txt
src/hud/hud-parallax.tsx
```

### Status

Active. Do not delete.

### Owns

- ambient HUD parallax feel
- COLOR / IR / SCAN visual treatment
- viewport-following HUD visual layer

### 9.5 HUD Tokens

File:

```txt
src/hud/hud-tokens.ts
```

### Status

Active token module.

### Owns

- HUD modes
- HUD visual tokens
- glow/opacity token helpers

### Must NOT own

- current runtime mode
- global spectrum state

Token ownership intentionally stays visual-only.

---

## 10. Spectrum / Mode Ownership

Main hook:

```txt
hooks/use-spectrum-mode.ts
```

### Owns

- app-level spectrum mode
- COLOR / IR / SCAN state
- SCAN override logic
- bridge to engine-level COLOR / IR where needed

### Runtime data flow

```txt
useSpectrumMode()
  → SystemShell
      → WorldLayer(mode)
      → ThreeRuntimeAdapter(snapshot.spectrumMode / internal scene mode bridge)
      → HUDLayer(spectrumMode)
      → HudSkeleton(mode)
          → ReticleController
          → HudParallax
```

### Important rule

`SystemShell` is the orchestrator.  
Child layers receive mode through props where practical.

### Known exception

`ThreeRuntimeAdapter` may still read `useSpectrumMode()` directly for scene-level spectrum application.  
This is accepted for now and belongs to future deeper adapter cleanup only if needed.

---

## 11. SDI / Diagnostics Ownership

Files:

```txt
src/sdi/core.ts
src/sdi/sdi-overlay.tsx
```

### Owns

- SDI metrics
- FPS / tier / DPR diagnostic display
- future spatial runtime performance intelligence

### Current mount

```txt
SystemShell → SdiOverlay
```

### Activation

The overlay is hidden unless enabled through localStorage:

```js
localStorage.setItem("spatial_sdi_debug", "1")
```

### Important refactor result

Before R5:

```txt
layout.tsx → SdiOverlay
```

After R5:

```txt
SystemShell → SdiOverlay
```

`layout.tsx` no longer owns SDI/runtime diagnostic layers.

---

## 12. Engine / State Ownership

Core:

```txt
src/template-kit/engine/core.ts
```

### Owns

- engine snapshot
- scroll progress
- sector index
- snapped state
- engine subscriptions
- dispatch commands
- low-level runtime state

### Public / bridge hooks

```txt
src/template-kit/hooks/use-system-state.ts
hooks/use-orbit-sector.ts
hooks/use-spectrum-mode.ts
```

### Rule

Engine owns low-level runtime state.  
React hooks expose derived or app-level bridges.  
Runtime layers should not invent independent copies of engine state.

---

## 13. Dormant / Future Modules

### Spline adapter

File:

```txt
src/scene/spline-adapter.tsx
```

Status:

```txt
KEEP / dormant adapter
```

Reason:

- planned future Spline scene integration
- not currently mounted
- not dead code

### use-system-state

File:

```txt
src/template-kit/hooks/use-system-state.ts
```

Status:

```txt
KEEP / template-kit API bridge
```

Reason:

- low-level React bridge to engine state
- useful for public template-kit API
- unused in app does not mean dead in kit

---

## 14. Ownership Rules

These rules are mandatory for future work.

### Root / Layout

1. `layout.tsx` must not mount runtime layers.
2. `layout.tsx` owns only framework-level concerns.
3. No HUD, SDI, Three, camera, overlay, or runtime logic belongs in root layout.

### Shell

4. `SystemShell` is the runtime orchestration owner.
5. All runtime visual layers must be mounted under `SystemShell`.
6. Spectrum overlays belong inside `SystemShell`.

### Runtime

7. Three.js exists only inside the runtime layer.
8. Camera logic must stay inside scene/camera modules or the adapter.
9. Input logic should be isolated from render logic when practical.
10. Render loop changes require visual verification.

### HUD

11. HUD belongs under `SystemShell`.
12. Reticle and parallax runtime belong to `HudSkeleton` unless explicitly migrated.
13. `HUDLayer` owns interface HUD, not root runtime ownership.
14. Reticle state should receive mode as an argument, not read spectrum globally.

### SDI

15. SDI overlay belongs under `SystemShell`.
16. SDI core may evolve into a runtime governor, but must not silently mutate rendering behavior without an explicit policy layer.

### Template Kit

17. Template-kit modules must remain reusable.
18. App-specific logic must not leak into template-kit core.
19. Dormant adapters may exist if clearly marked as future integration points.

---

## 15. Known Current Limitations

These are accepted for now.

```txt
SystemShell is still dense.
ThreeRuntimeAdapter still owns several responsibilities.
create-hero-asset.ts is still a large hero factory.
ThreeRuntimeAdapter may still read useSpectrumMode directly.
CameraDebugHUD still lives inside Three stage.
```

These are not urgent bugs. They are future cleanup candidates.

---

## 16. Refactor Milestones Completed

```txt
R1   Shell ownership diagnosis
R2   Layout cleanup diagnosis
R3   SystemShell entrypoint verification
R4   HUD consolidation
R4.5 Spectrum / IR / SCAN ownership cleanup
R5   SDI overlay relocation
R6   Dead / legacy audit
R7   ThreeRuntimeAdapter cleanup pass
```

Key outcomes:

```txt
layout.tsx is clean.
SystemShell owns runtime layers.
HudSkeleton is shell-owned.
SdiOverlay is shell-owned.
Reticle mode flow is explicit.
Pointer tracking is extracted.
Animation loop is split into update/render phases.
```

---

## 17. Future Backlog

### R8 — Hero Asset Factory Cleanup

Candidate:

```txt
src/scene/objects/create-hero-asset.ts
```

Potential cleanup:

```txt
loading
materials
effects
update hooks
spectrum response
```

### SDI Expansion

Future work:

```txt
device profiling
FPS monitoring
adaptive DPR
adaptive bloom
quality tiers
runtime governor
```

### Sound Layer

Future work:

```txt
ambient spatial sound
interaction sound cues
mode-aware sound profile
```

### Project Cards / CTA

Future work:

```txt
holographic project cards
CTA form
content interaction layer
```

---

## 18. Final Principle

This project is no longer treated as a loose portfolio page.

It is a spatial runtime system.

The primary rule is:

```txt
No feature may be added without declaring:
- owner layer
- mount location
- state source
- runtime impact
- cleanup condition
```
