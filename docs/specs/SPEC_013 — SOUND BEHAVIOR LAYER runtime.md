# SPEC_013 — Sound Behavior Layer Runtime

Status: Draft v0.1  
Owner: SURREAL_XP_LAB_FOLIO  
Depends On:

- SPEC_001_spatial_runtime_core
- SPEC_002_hud_interface_system
- SPEC_004_navigation_architecture

Related:

- SPEC_014_sound_behavior_state
- SPEC_008 — SOUND BEHAVIOR LAYER vision
- SOUND LAYER M1
- FOLIO Runtime
- Future Template Kit Extraction

---

# Purpose

The Sound Behavior Layer is a runtime observation system that translates existing application state into **SoundBehaviorState** (see SPEC_014).

It is not an audio engine.

It does not own playback, mixing, transitions, DSP, routing, or asset management.

Its responsibility is to answer:

> Given the current runtime state, what is the canonical semantic audio state?

The Sound Behavior Layer acts as a translation layer between runtime behavior and future audio orchestration.

---

# Design Philosophy

Sound is treated as a behavioral system rather than a soundtrack.

The layer does not describe music. It describes world state.

Users should experience sound as a consequence of entering states, sections, modes, and interactions.

```txt
Runtime State
        │
        ▼
Sound Behavior Layer
        │
        ▼
SoundBehaviorState          ← canonical contract: SPEC_014
        │
        ▼
Audio Runtime               ← future presentation layer
```

> The Sound Behavior Layer describes semantic audio layers, not playback requirements. A consumer may render all layers simultaneously, prioritize a subset, or collapse them into a single active profile depending on the needs of the experience.

---

# Goals

## G1 — State Translation

Translate runtime state into SoundBehaviorState.

## G2 — Runtime Observation

Observe existing systems without modifying them.

## G3 — Decoupling

Remain independent from:

- Camera Runtime
- HUD Runtime
- Navigation Runtime
- Three.js Runtime

## G4 — Debug Visibility

Allow sound behavior to be inspected without audio playback.

## G5 — Template Extraction Readiness

Use abstractions that can later be extracted into Template Kit systems.

---

# Non-Goals

The following are explicitly out of scope for v0.1:

- Audio playback, mixing, DSP, ducking
- Transition execution
- Audio asset management
- Recon route integration

---

# Runtime Inputs

The Sound Behavior Layer observes existing runtime systems.

## Engine Snapshot

Primary runtime source (`EngineSnapshot` from template-kit engine).

Observed values:

```txt
sectorName
sectorIndex
spectrum
isSnapped
soundEnabled
```

Note: `EngineSnapshot` is **runtime observation input**. It is not SoundBehaviorState.

## Spectrum Mode

App-layer authoritative values:

```txt
COLOR
IR
SCAN
```

SCAN is authoritative from Spectrum Mode, not from Engine `systemState`.

## Reticle State

Optional secondary source via `resolveReticleState`.

Observed values: `IDLE`, `HOVER`, `FOCUS`, `CTA`, etc.

---

# Output Contract

The mapper produces **SoundBehaviorState** as defined in SPEC_014:

```txt
activeSection
ambientLayer
sectionLayer
focusLayer
eventLayer
flags
triggerEvents
```

See SPEC_014 for field semantics, layer independence, and trigger lifecycle rules.

---

# Layer Resolution (Runtime)

Layers are resolved **independently** (not priority-collapsed at mapping time):

| Layer | Rule |
|---|---|
| `ambientLayer` | `IR_PROFILE` when spectrum is IR, else `VOID_PROFILE` |
| `sectionLayer` | `EXPLORATION_PROFILE` in ABOUT/PROJECTS, else `NONE` |
| `focusLayer` | `SCAN_PROFILE` when SCAN mode, else `NONE` |
| `eventLayer` | `CTA_PROFILE` in CTA zone, else `NONE` |

### Collapsed profile (debug convenience only)

For simple logging, consumers may call `collapseActiveProfile(state)` using SPEC_014 priority order. This is not the canonical state model.

---

# Trigger Model

## STATE_TRIGGER

```txt
IR_INIT_SAMPLE
SCAN_INIT_SAMPLE
```

Edge examples:

```txt
IR_ENTER / IR_EXIT
SCAN_ENTER / SCAN_EXIT
CTA_ENTER / CTA_EXIT
SECTOR_CHANGE
```

## EVENT_CONFIRM

```txt
CTA_SIGNAL_SAMPLE
```

Not yet wired in v0.1.

## Trigger lifecycle

`triggerEvents` are **pulses**. They must clear after stabilization. See SPEC_014.

---

# Debug Strategy

Debug overlay (key `B`) exposes semantic layers:

```txt
AMBIENT_LAYER
SECTION_LAYER
FOCUS_LAYER
EVENT_LAYER
FLAGS
TRIGGER_EVENTS
```

Optional collapsed line: `COLLAPSED_PROFILE` (consumer convenience).

No audio playback required.

---

# Architectural Principle

The Sound Behavior Layer does not generate sound. It generates meaning.

```txt
Runtime State
        │
        ▼
Sound Behavior Layer
        │
        ▼
SoundBehaviorState
        │
        ▼
Audio Runtime (future)
```

---

END OF DOCUMENT
