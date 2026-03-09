# AI OPS INDEX
## SURREAL EXP LAB
Version: v0.1
Status: Working Index
Last Updated: 2026-03-09

---

## Purpose
This index organizes the AI OPS documentation layer for the Surreal ExpLab ecosystem.
Its goal is to help AI assistants and collaborators quickly understand which documents
represent current system truth and which are planning or draft materials.

---

## Status Legend
Authoritative – current accepted system rules  
Operational – current development guidance  
Planning – roadmap sequencing guidance  
Draft – forward‑looking or exploratory  
Template – reusable structure

---

## Current Runtime Truths

1. Three.js runtime is **pinned in the shell** and never scrolls.
2. HTML sections scroll independently of the spatial stage.
3. Three renderer background is transparent.
4. The **WorldLayer owns the background and atmospheric visuals.**
5. Runtime must stay separated from the asset preparation pipeline.

---

## Current Development Position

Stage A – Spatial Shell ✔ completed  
Stage B – Scroll → Orbit camera bridge ✔ completed  
Stage C Step 1 – Runtime Snapshot integration ✔ completed  

Next target:

Stage C Step 2 – Camera Snapshot Bridge

---

## Document Categories

### Authoritative

ADR_0001_orchestrator_over_optimizer.md  
ADR_0002_void_hud_behavior.md  
ADR_0003_ir_global_mode.md  

SPEC_001_spatial_runtime_core.md  
SPEC_002_hud_interface_system.md  
SPEC_003_sdi_lite_runtime_governor.md  
SPEC_004_navigation_architecture.md  

ARCH_001_surreal_production_map.md  
ARCH_003_surreal_system_dependency_graph.md  

---

### Operational

SURREAL_AI_DEVELOPMENT_PROTOCOL.md  
AI_TOOLING_WORKFLOW.md

---

### Planning

ARCH_002_production_navigator.md  
surreal_template_kit_roadmap_v0.1_v0.4.md

---

### Draft / Forward Looking

SPEC_Experience_Flow_Scene_Lifecycle_v0_1.md  
orchestrator-blueprint.md

---

## Notes

This index does not replace the original documents.
It only defines **which ones should be trusted first** by AI assistants.

---

### Language Note

The project documentation is written in English.
However, development discussions and working conversations currently take place in Czech.
