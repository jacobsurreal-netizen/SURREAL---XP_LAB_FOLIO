# ADR_0004 — SCAN Mode Ownership

- Status: Accepted
- Date: 2026-03-27
- Scope: SURREAL_XP_LAB_FOLIO / Surreal Template Kit / Folio Experience Layer
- Related:
  - ADR_0001_orchestrator_over_optimizer.md
  - ADR_0003_ir_global_mode.md
  - SPEC_001_spatial_runtime_core.md
  - SPEC_002_hud_interface_system.md
  - SPEC_003_sdi_lite_runtime_governor.md

---

## Context

SCAN mode was introduced as a new global experiential mode intended to behave differently from existing COLOR and IR modes.

Unlike COLOR and IR, SCAN is not just a palette swap. It affects multiple layers at once:

- HUD microcopy tone
- Reticle behavior and visual style
- World overlay treatment
- Three runtime lighting and fog interpretation
- Hero asset materials, emissive behavior, halo, and particles
- Input handling and dev toggles
- Engine-safe fallback behavior

During implementation, SCAN exposed a cross-layer ownership problem:

- some layers treated SCAN as a real global mode
- some layers mapped it back to IR
- some layers had no knowledge of it at all
- some hooks kept local truth instead of shared truth

This created desynchronization between HUD, reticle, world layer, runtime, and hero asset behavior.

---

## Problem Statement

A global experiential mode cannot be introduced informally.

If the mode changes perception, rendering, and interaction at once, then ownership must be explicit:

- who owns the mode
- which layers must understand it
- which layers may degrade it safely
- which layers must never invent their own fallback silently

Without this, the system enters partial-state failure:

- one layer thinks SCAN is active
- another layer thinks IR is active
- another layer falls back to COLOR

Result: visual incoherence, debugging pain, duplicated logic, and broken confidence.

---

## Decision

### 1. SCAN is an **Experience Layer Mode**, not an Engine Core Mode

The engine core officially owns stable low-level spectrum states:

- COLOR
- IR

SCAN is owned by the app / experience layer.

This means:

- app-facing hooks may expose `COLOR | IR | SCAN`
- engine-facing hooks may continue using `COLOR | IR`
- SCAN may map to an engine-safe fallback internally when needed
- SCAN-specific behavior must be layered on top, not forced into engine assumptions prematurely

---

### 2. There must be **one authoritative app-level truth** for SCAN

SCAN cannot live as local React state inside multiple hook instances.

Required rule:

- if SCAN exists, every layer must read the same app-level state

Affected layers include:

- `SystemShell`
- `HUDLayer`
- `HudSkeleton`
- `ReticleController`
- `useReticleState`
- `WorldLayer`
- `ThreeRuntimeAdapter`
- hero asset spectrum application

If one of these consumes a different truth source, the mode is considered broken.

---

### 3. Global modes must be treated as **cross-layer contracts**

A new global mode is not considered implemented until all affected layers either:

- support it explicitly, or
- reject it explicitly, or
- degrade it through an intentional documented fallback

Silent fallback is forbidden.

Example:

- Allowed: `SCAN -> IR` fallback inside engine bridge, documented as engine-safe behavior
- Not allowed: component privately treating unknown SCAN as NORMAL because its local enum was never updated

---

### 4. SCAN must own its own visual language

SCAN is not IR with extra overlays.

SCAN must be allowed to define its own:

- HUD token family
- microcopy tone
- reticle behavior
- world suppression behavior
- artifact material branch
- scene lighting / fog interpretation

It may borrow engine-safe behavior from IR where necessary, but must remain semantically distinct.

---

### 5. Fallback boundaries must be explicit

The system must distinguish between:

#### App / Experience truth
- what the user is actually seeing and interacting with

#### Engine fallback truth
- what the lower-level runtime is allowed to do safely

This boundary must be documented in code where it exists.

Example pattern:

- app mode = `SCAN`
- engine mode = `IR` fallback
- hero asset mode = `SCAN`
- HUD mode = `SCAN`
- reticle mode = `SCAN`

This is valid if explicit.

---

## Ownership Model

### Experience Layer Owns

- SCAN mode activation
- SCAN mode semantics
- SCAN mode HUD identity
- SCAN microcopy resolver branch
- SCAN reticle branch
- SCAN world layer overlays
- SCAN visual experience tuning

### Engine / Template Kit Owns

- stable spectrum dispatch path
- safe fallback behavior
- low-level snapshot compatibility
- non-crashing render behavior
- deterministic global state propagation rules

### Hero Asset Owns

- material response to SCAN
- emissive response to SCAN
- particle palette and density response to SCAN
- halo behavior under SCAN

### Three Runtime Owns

- scene light interpretation
- fog interpretation
- renderer-safe adaptation of active mode

---

## Implementation Rules

When adding or modifying SCAN:

1. update app-level mode enum
2. update all mode mappings
3. update HUD tokens
4. update microcopy resolver
5. update reticle resolver / presentation
6. update world layer
7. update Three adapter
8. update hero asset material branch
9. verify engine fallback path
10. verify no component silently collapses SCAN back to COLOR/IR

---

## Verification Checklist

SCAN is not complete until all items below pass.

### State
- [ ] app-level `SpectrumMode` includes SCAN
- [ ] SCAN state is shared, not local-per-hook
- [ ] keyboard / control toggle can activate SCAN

### HUD
- [ ] HUD layer receives SCAN explicitly
- [ ] HUD token family contains SCAN
- [ ] microcopy resolver contains SCAN branch
- [ ] no HUD fallback silently maps SCAN to NORMAL

### Reticle
- [ ] reticle presentation supports SCAN
- [ ] reticle controller has SCAN branch
- [ ] reticle visual mode is not inherited accidentally from COLOR/IR

### World
- [ ] world layer receives SCAN explicitly
- [ ] SCAN overlay is visible and distinct

### Runtime
- [ ] Three adapter receives SCAN or a documented equivalent
- [ ] lights have SCAN branch or documented fallback
- [ ] fog has SCAN branch or documented fallback

### Asset
- [ ] hero asset material resolver accepts SCAN
- [ ] emissive branch exists for SCAN
- [ ] halo / particles adapt for SCAN

### System integrity
- [ ] `tsc --noEmit` passes
- [ ] no component logs unknown mode warnings
- [ ] screenshot verification confirms visual coherence

---

## Consequences

### Positive

- future global modes become easier to introduce
- debugging becomes faster because ownership is explicit
- SCAN remains a first-class experiential feature
- engine stability is preserved without flattening experience design

### Negative

- global modes now require cross-layer audits
- more explicit plumbing is required up front
- new modes cannot be treated as casual cosmetic additions

These costs are acceptable because hidden state divergence is worse.

---

## Anti-Patterns (Forbidden)

Do not:

- define SCAN in tokens but not in mode enums
- define SCAN in one component but not in its controller
- store SCAN override as local React state in multiple independent hooks
- silently normalize SCAN to another mode without documentation
- ship a new global mode before checking all affected layers

---

## Future Application

This ADR applies not only to SCAN but to any future cross-layer global state such as:

- GATEWAY mode
- TRANSMISSION mode
- ALERT / SIGNAL LOCK mode
- diagnostic overlays
- future sound-linked state regimes

Any new global experiential component or mode must follow this ownership model.

---

## Summary

SCAN revealed that the architecture was not broken, but the protocol for introducing global modes was incomplete.

This ADR formalizes the missing rule:

> A global mode must have one truth, explicit ownership, documented fallbacks, and a full cross-layer support audit.

That rule is now part of the system.
