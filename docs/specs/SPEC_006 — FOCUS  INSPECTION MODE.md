# SPEC_006 — FOCUS / INSPECTION MODE

Status: PROPOSAL

---

# PURPOSE

Enable controlled close interaction with spatial elements.

---

# CORE IDEA

Focus Mode is:

* temporary
* camera-driven
* context-aware

---

# ACTIVATION

Triggered by:

```text
VIEW_FOCUS_REQUEST
```

---

# BEHAVIOR

* camera moves to predefined focus state
* background dims subtly
* HUD shifts to analysis mode
* optional SCAN available

---

# CONSTRAINTS

* must not break navigation
* must not allow free camera control
* must restore previous state on exit

---

# EXIT

```text
VIEW_FOCUS_EXIT
```

Restores:

* camera
* global mode
* HUD state

---

# DESIGN GOAL

Focus = moment of attention.

---

END
