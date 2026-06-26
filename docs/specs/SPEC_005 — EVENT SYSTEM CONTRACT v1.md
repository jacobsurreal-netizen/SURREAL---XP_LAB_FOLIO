# SPEC_005 — EVENT SYSTEM CONTRACT v1

Status: PROPOSAL
Layer: Runtime / Experience Bridge

---

# 0. SYSTEM INTENT CHECK

This system must support:

* artifact-centered interaction
* camera-driven navigation (no DOM scrolling logic)
* HUD as translation layer, not UI system
* minimal UI, maximal atmosphere
* modular expansion (sound, CTA, projects)

If violated → reject spec.

---

# 1. PURPOSE

The Event System is the **communication backbone**.

It ensures:

* no direct coupling
* deterministic behavior
* safe system expansion

---

# 2. CORE PRINCIPLE

No system talks directly to another.

Only:

INPUT → EVENT → SYSTEM → EVENT → RESPONSE

---

# 3. EVENT FLOW

```text
INPUT → EVENT → RUNTIME → EVENT → HUD / SYSTEMS
```

Example:

```text
scroll → NAV_SNAP_REQUEST → camera → SECTOR_CHANGED
```

---

# 4. EVENT TYPES

## SYSTEM EVENTS (read-only)

Examples:

* SECTOR_CHANGED
* CAMERA_SNAP_COMPLETE
* MODE_CHANGED

HUD reacts only.

---

## COMMAND EVENTS (controlled)

Examples:

* MODE_CHANGE_REQUEST
* SCAN_ACTIVATE_REQUEST
* VIEW_FOCUS_REQUEST
* CTA_TRANSMISSION_REQUEST
* SOUND_ENABLE_REQUEST

Must go through validation.

---

## INTERNAL EVENTS

Hidden.

Example:

* CAMERA_ANIMATION_START
* SNAP_LOCKED

---

# 5. NAMING

```text
SYSTEM_ACTION_STATE
```

Requests:

```text
*_REQUEST
```

---

# 6. PRIORITY

1. Mode
2. Camera / Navigation
3. Focus / Inspection
4. CTA
5. HUD
6. Ambient

---

# 7. STATE OWNERSHIP

| System      | Owns               |
| ----------- | ------------------ |
| Runtime     | camera, navigation |
| Mode System | IR / SCAN          |
| HUD         | display            |
| SDI         | performance        |

Only owner mutates.

---

# 8. HUD ROLE

HUD is:

* reactive by default
* active only via approved commands

Active commands:

* IR / SCAN toggle
* sound opt-in
* CTA transmission
* VIEW_FOCUS_REQUEST

---

# 9. NAVIGATION

Scroll triggers camera only.

```text
scroll → NAV_SNAP_REQUEST → CAMERA_SNAP_COMPLETE → SECTOR_CHANGED
```

---

# 10. VIEW / FOCUS SYSTEM

Zoom is not free.

It is:

> controlled focus interaction

Flow:

```text
HUD → VIEW_FOCUS_REQUEST  
→ validation  
→ CAMERA_FOCUS_APPLIED
```

Rules:

* tied to sector
* predefined camera states
* cannot break navigation

---

# 11. MODE SYSTEM (LAYERED)

## GLOBAL MODES

* IR
* COLOR / SPECTRUM

Rules:

* persistent
* single active

---

## CONTEXTUAL MODE

SCAN:

* temporary
* overlay
* context-limited

---

## MODE STACK

```text
Global → base  
SCAN → overlay  
EXIT → restore global
```

---

# 12. SCAN ACTIVATION

Allowed only:

* during VIEW_FOCUS
* or explicitly enabled context

Flow:

```text
HUD → SCAN_ACTIVATE_REQUEST  
→ validation  
→ SCAN_MODE_ENTER  
→ SCAN_MODE_EXIT → restore
```

---

# 13. SAFETY RULES

* no direct mutation
* no loops
* debounce inputs
* enforce hysteresis

---

# 14. FAILSAFE

On error:

* ignore
* log
* fallback

Never crash.

---

# 15. LOGGING

Optional:

* timestamp
* event
* source

---

# 16. EXTENSIBILITY

New systems must:

* subscribe to events
* not couple

---

# 17. DESIGN GOAL

Event System = nervous system of spatial experience.

---

END
