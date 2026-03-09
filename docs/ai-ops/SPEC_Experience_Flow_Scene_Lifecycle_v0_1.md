# SPEC – Experience Flow & Scene Lifecycle
Version: v0.1
Status: Draft
Last Updated: 2026-03-09

---

## Purpose

Define a future‑compatible architecture for how spatial scenes,
UI layers, and runtime systems coordinate their lifecycle.

This document is exploratory and does not override the current runtime model.

---

## Core Idea

The experience should be driven by a unified runtime snapshot describing:

scrollProgress  
sectorIndex  
sectorName  
isSnapped

Subsystems read the snapshot and react deterministically.

---

## Intended Benefits

Predictable state flow  
Cleaner runtime interfaces  
Future camera choreography  
Sector‑aware interaction logic

---

## Implementation Status

Not yet implemented.

Current runtime still uses:

mapScrollToOrbit(progress)

Future direction:

mapSnapshotToOrbit(snapshot)

---

### Language Note

The specification is written in English for clarity and AI compatibility.
Development discussions and design reasoning occur in Czech.
