# ARCH_001 --- Surreal Production Map

Project: SURREAL EXP LAB\
Author: Jacob Surreal --- Architect of Space

## Purpose

This document defines the **system-level map of the Surreal
ecosystem**.\
It explains how major subsystems relate to each other and where
responsibilities lie.

It is intended for: - AI assistants - future collaborators - long‑term
architectural consistency

This document **does not contain implementation details**.\
It only defines **relationships and boundaries**.

------------------------------------------------------------------------

# Core Worlds

## SURREAL_XP_LAB_FOLIO

Public-facing spatial portfolio experience.

Role: - immersive spatial interface - cinematic exploration
environment - main runtime system

Contains: - spatial scene - camera system - navigation architecture -
HUD interface - performance governor (SDI)

------------------------------------------------------------------------

## SURREAL ASSET VAULT

Curated repository of all assets used in the ecosystem.

Role: - source of truth for raw and curated assets - controlled
ingestion pipeline - asset classification and naming consistency

Vault stores: - raw assets - curated versions - draft assets -
experimental assets

------------------------------------------------------------------------

## SURREAL ASSET ENGINE

Internal pipeline system used to prepare assets for runtime.

Role: - orchestration layer above external optimization tools -
validation of naming rules - packaging of assets for runtime use -
manifest generation

Important: The system **does not implement custom optimizers**. It
orchestrates existing industry tools.

------------------------------------------------------------------------

## AI OPS SYSTEM

Knowledge vault used to maintain architectural coherence.

Contains: - project principles - architectural decisions (ADR) -
architecture maps - technical specifications

Purpose: Ensure consistent reasoning across AI assistants.

------------------------------------------------------------------------

# Runtime Subsystems

## Spatial Runtime Core

Responsibilities: - scene loading - camera system - navigation logic -
interaction event system - feature switch interface

This system is the **foundation of the spatial environment**.

------------------------------------------------------------------------

## HUD Interface System

Role: Overlay information and navigation over the spatial scene.

Principles: - low visual dominance - fade on inactivity - brighten on
interaction

HUD interacts with: - navigation system - world state - user input

------------------------------------------------------------------------

## Spatial Design Intelligence (SDI)

Runtime performance governor.

Responsibilities: - monitor runtime performance - control visual
complexity - maintain cinematic framerate stability

Operates by: - measuring metrics - selecting quality levels -
enabling/disabling scene features

------------------------------------------------------------------------

# Asset Pipeline Flow

Asset Vault ↓ Asset Engine ↓ Asset Orchestrator ↓ Runtime-ready asset
packages ↓ Folio Runtime Loader

Runtime never loads **raw assets** directly.

------------------------------------------------------------------------

# Global Visual Modes

## IR Mode

IR mode is a global visual state.

Characteristics: - available from the start - persistent across
sessions - affects both UI tokens and scene appearance

IR state must be readable by: - HUD system - runtime renderer

------------------------------------------------------------------------

# Architectural Rule

All systems must follow:

-   modular boundaries
-   orchestration layers instead of reinvented engines
-   separation of runtime and pipeline systems

This architecture ensures the ecosystem remains **scalable and
maintainable**.

------------------------------------------------------------------------

END OF DOCUMENT
