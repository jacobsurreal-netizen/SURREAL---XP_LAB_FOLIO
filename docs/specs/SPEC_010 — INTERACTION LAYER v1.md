# SPEC_010 — INTERACTION LAYER v1

Status: PROPOSAL

---

# PURPOSE

Defines how user input becomes system events.

---

# INPUT TYPES

* scroll → navigation
* click / tap → interaction
* hover / proximity → awareness
* keyboard (optional)

---

# CORE RULE

All input must convert to events.

No direct system manipulation.

---

# FLOW

INPUT → EVENT → SYSTEM RESPONSE

---

# PRIORITY

1. Mode (SCAN / IR)
2. Navigation
3. Focus
4. CTA

---

# CONSTRAINTS

* no conflicting inputs
* debounce rapid input
* no direct DOM-based navigation

---

# DESIGN GOAL

Interaction must feel:

> intentional, minimal, spatial

---

END
