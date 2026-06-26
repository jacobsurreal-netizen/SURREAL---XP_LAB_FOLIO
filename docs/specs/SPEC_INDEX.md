# SPEC_INDEX

Status: Reference Map
Purpose: Provide a clear navigation structure for system contracts

---

# 0. HOW TO READ THIS SYSTEM

This project is a **spatial runtime system**, not a traditional website.

All systems must follow:

* Event-driven communication
* Strict state ownership
* Layer separation (runtime / HUD / experience)

This index defines how individual specifications relate to each other.

---

# 1. CORE SYSTEM CONTRACTS

These define how the system behaves at the lowest level.

* SPEC_005_event_system_contract_v0_2
  → defines communication between all systems

* SPEC_007_state_contract_v0_1
  → defines state ownership and mutation rules

---

# 2. INTERACTION LAYER

These define how user input becomes system behavior.

* SPEC_010_interaction_layer_v0_1
  → input → event mapping

* SPEC_006_focus_inspection_mode_v0_1
  → controlled camera focus interaction

---

# 3. EXPERIENCE SYSTEMS

These define higher-level behavior layers.

* SPEC_008_sound_behavior_layer_v1
  → atmospheric audio vision (high-level)

* SPEC_013_sound_behavior_layer_runtime
  → runtime observation and behavior mapping

* SPEC_014_sound_behavior_state
  → canonical semantic audio state contract

* SPEC_009_project_system_v1
  → project interaction system (cards / nodes)

---

# 4. SAFETY & DATA

These ensure system stability and consistency.

* SPEC_011_runtime_failsafe_v1
  → error handling and recovery

* SPEC_012_data_content_contract_v1
  → minimal data structure rules

---

# 5. FOUNDATIONAL ARCHITECTURE (REFERENCE)

These documents define the base runtime and must not be violated.

* SPEC_001_spatial_runtime_core

* SPEC_002_hud_interface_system

* SPEC_003_sdi_lite_runtime_governor

* SPEC_004_navigation_architecture

* ARCH_001_surreal_production_map

* ARCH_003_surreal_system_dependency_graph

---

# 6. GOVERNANCE & AI BEHAVIOR

These define how AI assistants must operate.

* SURREAL_AI_DEVELOPMENT_PROTOCOL
* AI_TOOLING_WORKFLOW
* GLOBAL_COMPONENT_INTEGRATION_MANUAL

---

# 7. CURRENT SYSTEM STATE

These describe current implementation status.

* STATUS_current_runtime_state
* SURREAL_v1_status_and_next_steps

---

# 8. FORWARD / NON-AUTHORITATIVE DOCUMENTS

These describe future direction and must not override runtime rules.

* SURREAL_SPEC_Experience_Flow_Scene_Lifecycle_v0_1
* SURREAL_SPEC_Experience_Flow_Scene_Lifecycle_v0_1_audited
* surreal_template_kit_roadmap_v0.1_v0.4

---

# 9. CRITICAL RULES

* Event system is the only communication layer
* State must not be mutated outside its owner
* HUD must remain a translation layer, not a control system
* Spatial navigation must remain camera-driven
* Systems must remain modular and decoupled

---

# 10. FINAL NOTE

This index does not replace specifications.

It only ensures that:

* AI assistants understand system structure
* documents are interpreted in correct context
* no subsystem is misused or overextended

---

END OF DOCUMENT
