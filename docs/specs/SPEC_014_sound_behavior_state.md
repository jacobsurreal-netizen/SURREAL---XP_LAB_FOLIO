# SPEC_014 — Sound Behavior State

Status: Draft v0.1  
Owner: SURREAL_XP_LAB_FOLIO  
Depends On:

- SPEC_013_sound_behavior_layer_runtime

Related:

- SPEC_008 — SOUND BEHAVIOR LAYER vision
- Future Audio Runtime (M1+)

---

# Purpose

Define the **canonical semantic audio state** produced by the Sound Behavior Layer.

This document describes **meaning**, not playback.

It does not define:

- WebAudio
- mixers
- transitions
- ducking
- DSP
- asset loading

---

# Architectural Position

```txt
Runtime State
        │
        ▼
Sound Behavior Layer        ← SPEC_013
        │
        ▼
SoundBehaviorState          ← SPEC_014 (this document)
        │
        ▼
Audio Runtime               ← future
```

| Layer | Responsibility |
|---|---|
| Runtime State | Engine snapshot, spectrum mode, HUD-derived signals |
| Sound Behavior Layer | Observe runtime, map inputs, emit state |
| SoundBehaviorState | Semantic audio layers independent of rendering strategy |
| Audio Runtime | Interpret state and perform playback |

**SPEC_013** owns observation and mapping.  
**SPEC_014** owns the output contract.  
These documents are intentionally separate.

---

# Design Philosophy

SoundBehaviorState describes **semantic audio layers**.

It does not prescribe playback.

> The Sound Behavior Layer describes semantic audio layers, not playback requirements. A consumer may render all layers simultaneously, prioritize a subset, or collapse them into a single active profile depending on the needs of the experience.

This allows one behavior model to support multiple playback strategies.

The behavior model remains stable while playback strategies remain interchangeable.

---

# State Structure

Canonical `SoundBehaviorState` fields:

```txt
activeSection     — navigation context (HERO | ABOUT | PROJECTS | CTA)
ambientLayer      — sustained atmospheric bed
sectionLayer      — sector-driven exploration mood
focusLayer        — temporary analytical overlay (e.g. SCAN)
eventLayer        — contact / signal moment (e.g. CTA)
flags             — sustained runtime modifiers
triggerEvents     — ephemeral edge events (pulse, never latched)
```

## Semantic Layers

### AMBIENT_LAYER

Sustained atmospheric presence.

| Value | Meaning |
|---|---|
| `VOID_PROFILE` | Default spatial bed |
| `IR_PROFILE` | IR spectrum treatment |

### SECTION_LAYER

Sector-driven exploration mood.

| Value | Meaning |
|---|---|
| `EXPLORATION_PROFILE` | ABOUT / PROJECTS exploration context |
| `NONE` | No section layer active |

### FOCUS_LAYER

Temporary analytical overlay.

| Value | Meaning |
|---|---|
| `SCAN_PROFILE` | SCAN mode active |
| `NONE` | No focus overlay |

### EVENT_LAYER

Contact / transmission moment.

| Value | Meaning |
|---|---|
| `CTA_PROFILE` | CTA zone active |
| `NONE` | No event layer active |

### FLAGS

Sustained modifiers derived from runtime observation.

Examples: `SNAPPED`, `SOUND_ENABLED`, `IR_MODE`, `SCAN_MODE`, `CTA_ZONE`, `FOCUS_STATE`.

### TRIGGER_EVENTS

Ephemeral edge events.

Examples: `SCAN_ENTER`, `IR_ENTER`, `CTA_ENTER`, `SECTOR_CHANGE`.

**Lifecycle rule:** trigger events are pulses. They must return to `NONE` (empty) after state stabilization. They must never remain active as sustained state.

---

# Layer Independence

Layers are **independent semantic channels**.

Multiple layers may be active simultaneously.

Example — SCAN on PROJECTS in IR:

```txt
ambientLayer:   IR_PROFILE
sectionLayer:   EXPLORATION_PROFILE
focusLayer:     SCAN_PROFILE
eventLayer:     NONE
```

A future Audio Runtime may:

- render all layers at once
- prioritize focus over ambient
- collapse layers into a single `activeProfile` for simple playback

Collapse is a **consumer strategy**, not a requirement of this contract.

---

# Collapsed Profile (Consumer Convenience)

For simple consumers (debug HUD, M1 logging), a priority collapse is available:

```txt
1. focusLayer   → SCAN_PROFILE
2. eventLayer   → CTA_PROFILE
3. sectionLayer → EXPLORATION_PROFILE
4. ambientLayer → IR_PROFILE
5. ambientLayer → VOID_PROFILE
```

Reference implementation: `collapseActiveProfile()` in `src/sound/behavior-mapper.ts`.

This is **not** a replacement for the layered state model.

---

# Reference Mapping

```txt
AMBIENT_PROFILE_A  → ambientLayer: VOID_PROFILE
AMBIENT_PROFILE_B  → ambientLayer: IR_PROFILE
SECTION_PROFILE    → sectionLayer: EXPLORATION_PROFILE
FOCUS_PROFILE      → focusLayer: SCAN_PROFILE
EVENT_PROFILE      → eventLayer: CTA_PROFILE

EVENT_CONFIRM      → triggerEvents: CTA_SIGNAL_SAMPLE (future)
STATE_TRIGGER      → triggerEvents: IR_INIT_SAMPLE | SCAN_INIT_SAMPLE
TRANSITION         → future Audio Runtime concern
```

---

# Non-Goals

- Playback execution
- Mixing or gain staging
- Transition asset scheduling
- Recon route integration (v0.1)

---

# Implementation Reference

| Artifact | Location |
|---|---|
| State types | `src/sound/types.ts` |
| Layer mapper | `src/sound/behavior-mapper.ts` |
| React observer | `src/sound/use-sound-behavior.ts` |
| Debug overlay | `src/sound/sound-debug-hud.tsx` |

---

END OF DOCUMENT
