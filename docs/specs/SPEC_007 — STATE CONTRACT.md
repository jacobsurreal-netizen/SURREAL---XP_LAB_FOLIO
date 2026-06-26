# SPEC_007 — STATE CONTRACT

Status: PROPOSAL

---

# PURPOSE

Define where state lives and who controls it.

---

# CORE RULE

Every state has ONE owner.

---

# STATE MAP

| State             | Owner       |
| ----------------- | ----------- |
| camera position   | Runtime     |
| active sector     | Runtime     |
| global mode       | Mode System |
| scan mode         | Mode System |
| focus state       | Runtime     |
| HUD display       | HUD         |
| performance level | SDI         |

---

# RULES

* only owner may mutate
* others must request

---

# SYNC MODEL

Event-driven only.

No shared mutable state.

---

# CONFLICT RESOLUTION

Priority:

Mode > Camera > Focus > HUD

---

# RESTORE RULE

Temporary states must restore:

* previous mode
* previous camera
* previous HUD

---

# FAILSAFE

If conflict:

* fallback to last stable state

---

# DESIGN GOAL

State must be:

* predictable
* isolated
* reversible

------------------------------------------------------------------------

State changes must occur only through validated event flow.
Direct mutation outside event system is forbidden.

------------------------------------------------------------------------

END