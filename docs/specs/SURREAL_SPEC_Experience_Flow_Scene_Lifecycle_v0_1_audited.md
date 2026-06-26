
# SURREAL SPEC
## Experience Flow & Scene Lifecycle
### Version: v0.1 (Audited Draft)
### Status: Forward-Compatible Specification

---

## 1. Purpose

This document describes the **future-oriented experience flow and scene lifecycle model**
for spatial experiences built within the **SURREAL EXP LAB ecosystem**.

It does **not override the current runtime architecture**. Instead, it defines a
forward-compatible direction for how spatial scenes may be orchestrated as the
runtime evolves.

The goal is to:

- maintain architectural clarity for AI assistants
- describe the intended scene orchestration model
- ensure compatibility with the current runtime stack

---

## 2. Current Authoritative Runtime Stack

The current spatial runtime follows this structure:

SystemShell
│
├─ z0  WorldLayer
├─ z1  ThreeRuntimeAdapter (Pinned Spatial Stage)
├─ z5  Section Orientation Labels
├─ z10 Scrollable Content Sections
│     ├ HeroSection
│     ├ AboutSection
│     ├ ProjectsSection
│     └ ContactSection
│
├─ z30 HUDLayer
└─ z40 IR Global Overlay

Key rules:

- Three runtime is **pinned**.
- Sections scroll around the spatial stage.
- The background is owned by **WorldLayer**, not Three.js.
- HUD remains minimal and independent.

---

## 3. Sector-Based Experience Model

Current navigation is **sector-driven**, not scene-switch driven.

Primary sectors:

- HERO
- ABOUT
- PROJECTS
- CTA

These sectors represent **narrative regions** of the spatial experience.

Camera behavior, orbit offsets, and interaction cues are derived from the
current sector state provided by the engine.

---

## 4. Engine Snapshot Contract

The runtime engine provides a snapshot used by multiple subsystems:

Example snapshot:

{
  scrollProgress: number,
  sectorIndex: number,
  sectorName: string,
  isSnapped: boolean,
  systemState: string,
  spectrum: string,
  language: string
}

This snapshot is the **source of truth** for:

- navigation state
- sector transitions
- HUD feedback
- camera orchestration

---

## 5. Future Scene Lifecycle Model

Future spatial experiences may extend the runtime with a scene lifecycle model.

Example lifecycle:

Scene.init()
Scene.update(deltaTime)
Scene.destroy()

Scenes would represent **modular spatial experiences** layered on top of the
pinned spatial stage.

However:

- scenes must not control the core runtime
- scenes must not bypass the engine state
- scenes must remain replaceable modules

---

## 6. Asset Pipeline Rule

Runtime must **never load raw assets directly from the Asset Vault**.

Valid pipeline:

Asset Vault
↓
Asset Engine
↓
Runtime-ready assets
↓
Spatial Runtime

This separation guarantees:

- predictable runtime performance
- stable deployment builds
- clean asset versioning

---

## 7. SDI Compatibility

All scene orchestration must remain compatible with **SDI Lite Runtime Governor**.

SDI responsibilities include:

- performance monitoring
- adaptive rendering adjustments
- frame stability enforcement

Scenes must therefore avoid:

- uncontrolled particle systems
- expensive shader stacks
- unbounded asset loading

---

## 8. Long-Term Direction

The long-term direction for the Surreal ecosystem includes:

- modular spatial scenes
- sector-driven navigation
- engine-synchronized camera orchestration
- asset streaming through the pipeline
- performance-aware runtime behavior

The pinned spatial stage remains the **foundation** of the experience model.

---

## 9. Status

This document represents:

Forward-compatible architecture guidance.

It is **not an authoritative runtime specification** but a design reference
for future expansion of the spatial experience system.
