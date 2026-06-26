# ARCH_003 --- Surreal System Dependency Graph

Project: SURREAL EXP LAB Author: Jacob Surreal --- Architect of Space

## Purpose

This document defines the **system dependency graph** for the Surreal
ecosystem.

It provides a clear view of:

-   how subsystems depend on each other
-   which layers interact directly
-   where architectural boundaries exist
-   how future systems can be integrated safely

The goal is to maintain **modularity, scalability, and production
safety**.

This document is intentionally **high‑level** and avoids implementation
details.

------------------------------------------------------------------------

# System Layers Overview

The Surreal ecosystem is divided into **four architectural layers**.

    Knowledge Layer
    Pipeline Layer
    Runtime Layer
    Experience Layer

Each layer has clearly defined responsibilities.

------------------------------------------------------------------------

# 1 --- Knowledge Layer

Responsible for architectural reasoning and documentation.

    AI OPS SYSTEM
    │
    ├─ Principles
    ├─ ADR Decisions
    ├─ Architecture Maps
    └─ Technical Specifications

Purpose:

-   maintain system philosophy
-   track architectural decisions
-   guide AI assistants

This layer does **not interact with runtime code directly**.

------------------------------------------------------------------------

# 2 --- Pipeline Layer

Responsible for asset preparation and validation.

    Asset Vault
       ↓
    Asset Engine
       ↓
    Asset Orchestrator
       ↓
    Runtime Asset Packages

Responsibilities:

-   asset curation
-   naming validation
-   tier compatibility rules
-   asset packaging
-   manifest generation

Runtime systems should **never load raw assets** from the vault.

------------------------------------------------------------------------

# 3 --- Runtime Layer

Responsible for running the spatial environment.

    Spatial Runtime Core
    │
    ├─ Scene Loader
    ├─ Camera Controller
    ├─ Interaction Event Bus
    ├─ Feature Switch System
    └─ Metrics Monitor

This layer provides the **foundation for all runtime behavior**.

------------------------------------------------------------------------

# 4 --- Experience Layer

Responsible for user-facing systems and visual experience.

    Experience Layer
    │
    ├─ Spatial Scene
    ├─ HUD Interface System
    ├─ Navigation Architecture
    └─ Spatial Design Intelligence (SDI)

Responsibilities:

-   spatial interaction
-   user guidance
-   cinematic presentation
-   runtime performance control

------------------------------------------------------------------------

# Cross‑System Dependencies

The following relationships must remain stable:

    HUD System
       depends on → Interaction Event Bus

    SDI
       depends on → Metrics Monitor
       controls   → Feature Switch System

    Spatial Scene
       depends on → Runtime Asset Packages

    Runtime Loader
       reads → Asset Manifest

These dependencies allow systems to evolve independently while remaining
compatible.

------------------------------------------------------------------------

# Global System States

Certain states affect multiple subsystems.

Example:

## IR Mode

Global visual state affecting:

-   HUD tokens
-   scene rendering
-   visual palette

IR state must be accessible to both **HUD System** and **Runtime
Renderer**.

------------------------------------------------------------------------

# Architectural Boundaries

The following boundaries must always remain respected:

Pipeline systems must not depend on runtime systems.

Runtime systems must not directly modify pipeline assets.

Knowledge systems must remain documentation‑focused.

These boundaries protect the ecosystem from **tight coupling**.

------------------------------------------------------------------------

# Future Expansion Zones

The architecture allows integration of additional systems such as:

    Surreal Hub Studio
    Surreal Infinity World
    AR Interaction Layer
    AI Behavior Systems
    Analytics & Telemetry

These systems should attach to the architecture **without breaking
existing layers**.

------------------------------------------------------------------------

# Design Principle

The Surreal ecosystem is built around **orchestration rather than
reinvention**.

Systems coordinate specialized tools rather than replacing them.

This approach ensures:

-   faster development
-   higher reliability
-   easier long‑term evolution

------------------------------------------------------------------------

END OF DOCUMENT
