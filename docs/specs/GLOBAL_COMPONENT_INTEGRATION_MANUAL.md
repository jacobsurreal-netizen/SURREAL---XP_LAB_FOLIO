# Global Component Integration Manual

## Purpose

This manual exists to prevent repeat pain when introducing a new global mode, global interaction layer, or any component that affects multiple architectural layers at once.

Use it before implementing things like:

- new spectrum modes
- new diagnostic overlays
- new sound state layers
- new gateway / transmission states
- new global interaction regimes
- cross-layer UI/runtime/world effects

If a feature changes more than one of these at the same time, it is a **global component**:

- HUD
- Reticle
- World layer
- Three runtime
- Asset materials
- Input / controls
- Engine snapshot / state

---

## Core Principle

A global component is **not done** when it renders.

A global component is done only when:

- state ownership is explicit
- all affected layers are audited
- fallbacks are documented
- visual and runtime behavior are synchronized

---

## Classification Step

Before writing code, classify the feature.

### Type A — Local component
Only affects one layer.

Examples:
- a button
- one content card
- one microcopy block

### Type B — Cross-layer component
Affects two or more layers.

Examples:
- SCAN mode
- sound-triggered navigation cue
- project card opening that also affects camera + HUD

If the answer is Type B, use this manual.

---

## Global Component Intake Form

Fill this out briefly before coding.

### 1. Name
Example: SCAN mode

### 2. Category
- mode
- overlay
- state machine
- interaction system
- rendering behavior
- audio behavior

### 3. Ownership
Who owns meaning?
- Template Kit
- Folio / Experience Layer
- Shared / mixed boundary

### 4. Truth source
Where is the authoritative state stored?

### 5. Engine fallback
If engine cannot understand it directly, what is the explicit fallback?

### 6. Affected layers
Check all that apply:
- [ ] App state
- [ ] Engine state
- [ ] SystemShell
- [ ] HUDLayer
- [ ] HudSkeleton
- [ ] Reticle
- [ ] WorldLayer
- [ ] ThreeRuntimeAdapter
- [ ] Hero asset
- [ ] Microcopy
- [ ] Input / keyboard
- [ ] Sound layer
- [ ] Project cards

If you cannot answer these questions, do not start implementation yet.

---

## Implementation Protocol

### Step 1 — Declare the mode / feature in one place
Create or update the canonical app-level type.

Example:

```ts
export type SpectrumMode = "COLOR" | "IR" | "SCAN"
```

Do not add the feature visually before the type and truth source exist.

---

### Step 2 — Decide whether it is engine-native or experience-only
Ask:

- Can the engine truly support this state?
- Or is this an experience-layer interpretation over engine-safe behavior?

Document one of these two answers:

#### Engine-native
The engine understands it directly.

#### Experience-only with fallback
The app understands it, engine receives a safe degraded equivalent.

Example:
- app mode = SCAN
- engine fallback = IR

---

### Step 3 — Make truth shared, never local-per-hook
If a mode is global, multiple hook instances must not each hold their own override state.

Use:
- engine snapshot
- context
- shared external store
- documented global signal source

Do not use:
- isolated local state hidden inside multiple custom hooks

---

### Step 4 — Audit every affected layer before styling anything
Use this checklist:

#### State
- [ ] type updated
- [ ] source of truth updated
- [ ] toggles updated

#### HUD
- [ ] token branch exists
- [ ] controller or mapping exists
- [ ] microcopy branch exists

#### Reticle
- [ ] mode resolver knows the new state
- [ ] renderer/controller supports it

#### World
- [ ] world overlay branch exists

#### Three runtime
- [ ] snapshot shape updated if needed
- [ ] light / fog / post-process branches updated

#### Asset
- [ ] material resolver updated
- [ ] emissive / pulse logic updated
- [ ] particles / halo updated if necessary

Do not start visual tweaking before this checklist is green.

---

### Step 5 — Add explicit fallback comments
Wherever a feature degrades to something else, write it down in code.

Bad:

```ts
return "IR"
```

Good:

```ts
// Engine-safe fallback: SCAN remains app-level, engine uses IR-compatible path.
return "IR"
```

This reduces future confusion dramatically.

---

### Step 6 — Verify with screenshots, not only code
For any global visual component, collect screenshots for:

- COLOR
- IR
- new mode / state

Across at least two sectors.

If screenshots are visually inconsistent, the component is not finished.

---

## Leak Detection Guide

Use this when a new global feature behaves inconsistently.

### Symptom: one layer updates, another does not
Likely cause:
- multiple truth sources
- one layer has local state
- one layer is still reading engine fallback only

### Symptom: TS passes, viewport is wrong
Likely cause:
- visual branch missing in one renderer/controller
- token family missing
- asset/material branch still using old mode

### Symptom: HUD changes but 3D object does not
Likely cause:
- Three adapter not receiving the mode
- hero asset apply function not updated
- runtime normalizer collapsing the new mode

### Symptom: world layer changes but reticle does not
Likely cause:
- reticle controller / token enum missing the new branch

### Symptom: everything compiles but mode looks like an old mode
Likely cause:
- one or more layers are silently falling back to legacy branches

---

## Red Flags

If any of these appear, stop and audit before adding more code.

- a new mode exists in tokens but not in enums
- a mode exists in one component but not in its controller
- a shared hook hides local override state
- a feature needs changes in 4+ files and no checklist exists
- the same global concept is named differently across layers
- screenshots show mixed identities from two modes at once

---

## Minimum Delivery Standard for Global Components

Before considering a global feature “done”, all of the following must be true.

- [ ] single source of truth exists
- [ ] affected layers list was completed
- [ ] every affected layer either supports or explicitly rejects the feature
- [ ] fallback path is documented
- [ ] TypeScript passes
- [ ] runtime does not crash
- [ ] screenshots confirm coherence
- [ ] one checkpoint commit exists before visual polish

---

## Recommended Branch Workflow

For a new global component:

1. create dedicated branch
2. add state + truth source
3. commit
4. add cross-layer plumbing
5. commit
6. add visual identity
7. commit
8. polish only after screenshots confirm coherence

Suggested commit categories:

- `feat(mode): add shared state contract`
- `feat(mode): wire runtime and hud support`
- `feat(mode): add asset/material branch`
- `style(mode): tune visual identity`

---

## Template for Future Global Components

Copy this into a scratch doc before implementation.

```md
# Global Component Intake

Name:
Category:
Owner:
Truth source:
Engine fallback:
Affected layers:
- App state
- Engine state
- SystemShell
- HUD
- Reticle
- World
- Three runtime
- Asset
- Microcopy
- Input
- Sound
- Other:

Completion checklist:
- [ ] types updated
- [ ] shared truth exists
- [ ] fallback documented
- [ ] HUD updated
- [ ] Reticle updated
- [ ] World updated
- [ ] Runtime updated
- [ ] Asset updated
- [ ] screenshots verified
```

---

## Final Rule

When a component changes the meaning of the world, it must be treated as a system feature, not a cosmetic patch.

That is the difference between:

- “adding a mode”
- and building a real spatial interface system

Use this manual every time you touch the second category.
