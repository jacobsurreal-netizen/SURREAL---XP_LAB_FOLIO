# SPEC_009 — PROJECT SYSTEM (Cards / Nodes) v1

Status: PROPOSAL / SKELETON
Layer: Experience Layer
Depends on:

* SPEC_005_event_system_contract_v0_2
* SPEC_006_focus_inspection_mode_v0_1
* SPEC_007_state_contract_v0_1

---

# 0. SYSTEM INTENT CHECK

Projects are not content blocks.

Projects are:

* artifacts
* signals
* entry points to deeper context

The system must support both:

* v1 → UI-based representation (cards)
* v2 → spatial representation (nodes)

Without breaking architecture.

---

# 1. PURPOSE

Define how project entities behave inside the spatial system.

The Project System provides:

* discoverability
* interaction
* focus / inspection
* transition into deeper layers (future)

---

# 2. CORE PRINCIPLE

> Projects are interaction entities, not UI components.

They must:

* exist within spatial navigation logic
* respond to camera and focus
* integrate with HUD and event system

---

# 3. REPRESENTATION MODES

## V1 — PROJECT CARDS

* screen-aligned or UI-anchored
* simplified interaction layer
* optimized for clarity and speed

Used when:

* performance constraints exist
* system is in early stage
* UI clarity is priority

---

## V2 — PROJECT NODES

* spatially placed objects
* part of the scene
* interactable through camera and proximity

Used when:

* full spatial experience is desired
* performance allows it

---

## RULE

Both representations must expose the same interaction contract.

---

# 4. INTERACTION MODEL

Projects must support:

* hover / proximity awareness
* focus / inspection entry
* selection (primary interaction)

Flow:

```text
USER → PROJECT_INTERACT_REQUEST  
→ validation  
→ VIEW_FOCUS_REQUEST  
→ CAMERA_FOCUS_APPLIED  
→ PROJECT_ACTIVE
```

---

# 5. EVENT INTEGRATION

Project System listens to:

* SECTOR_CHANGED
* VIEW_FOCUS_ENTER
* VIEW_FOCUS_EXIT
* MODE_CHANGED

Project System emits:

* PROJECT_HOVERED
* PROJECT_SELECTED
* PROJECT_FOCUS_ENTER
* PROJECT_FOCUS_EXIT

---

# 6. FOCUS BEHAVIOR

When project enters focus:

* camera moves to predefined state
* project becomes primary subject
* surrounding elements may dim
* HUD displays project metadata

Focus must:

* not break navigation
* be reversible
* respect global mode

---

# 7. HUD INTEGRATION

HUD may display:

* project title
* short description
* metadata
* CTA entry (optional)

HUD must not:

* duplicate project interaction logic
* become primary navigation system

---

# 8. SCAN MODE INTEGRATION

During SCAN:

* project may expose additional data
* visual / informational layer may increase

SCAN must remain:

* contextual
* temporary
* reversible

---

# 9. CTA RELATION

Projects may lead to:

* deeper project detail (future)
* CTA interaction (contact / signal)

Project interaction must not force CTA.

CTA must remain intentional.

---

# 10. SDI / PERFORMANCE

System must support scaling:

V1:

* lightweight UI cards
* minimal GPU impact

V2:

* spatial nodes
* controlled complexity

Project system must degrade gracefully based on SDI.

---

# 11. DATA CONTRACT (HIGH LEVEL)

Each project must expose:

* id
* title
* short description
* visual representation reference
* optional metadata

Implementation format is flexible.

---

# 12. FAILSAFE

If project fails:

* hide safely
* keep navigation intact
* do not block interaction

---

# 13. NON-GOALS

This spec does NOT define:

* exact card design
* exact 3D model
* layout grid
* animation timing
* styling

---

# 14. DESIGN GOAL

Projects should feel like:

> objects waiting to be discovered, not items in a list.

---

END OF DOCUMENT
