# SPEC_003 --- SDI Lite Runtime Governor

Project: SURREAL EXP LAB Subsystem: SURREAL_XP_LAB_FOLIO Runtime Author:
Jacob Surreal --- Architect of Space

## Objective

Define **SDI Lite (Spatial Design Intelligence Lite)** --- a
deterministic runtime performance governor designed to maintain stable
FPS in spatial WebGL scenes.

The system dynamically adjusts scene complexity based on runtime
metrics.

Important:

SDI Lite does **not require AI**. It operates using deterministic
policies.

------------------------------------------------------------------------

# AUTHORITY

This is the authoritative SDI runtime specification.

Other SDI documents provide:
- extended explanation
- design reasoning
- future expansion notes

------------------------------------------------------------------------

# Architecture

SDI Lite consists of four modules:

SpatialDesignIntelligence │ ├─ Metrics Collector ├─ Budget Manager ├─
Policy Engine └─ Runtime Controller

Each module performs a distinct role.

------------------------------------------------------------------------

# 1 --- Metrics Collector

Responsible for monitoring runtime performance.

Sampling interval:

0.5--1 second

Tracked metrics:

• FPS • frame time • device pixel ratio • visible object count •
particle count • active effects

Example:

{ "fps": 52, "frameTime": 18.3, "particles": 280, "objectsVisible": 22 }

------------------------------------------------------------------------

# 2 --- Budget Manager

Defines rendering quality levels.

Quality tiers:

Q0 --- Showcase\
Q1 --- Standard\
Q2 --- Balanced\
Q3 --- Performance\
Q4 --- Survival

Each level defines limits for:

• particles • post-processing • fog • lighting complexity

------------------------------------------------------------------------

# 3 --- Policy Engine

Decides when quality levels should change.

Example rules:

FPS ≥ 58 → Q0\
FPS 50--58 → Q1\
FPS 40--50 → Q2\
FPS 30--40 → Q3\
FPS \< 30 → Q4

A hysteresis delay of 2--3 seconds should be used to avoid oscillation.

------------------------------------------------------------------------

# 4 --- Runtime Controller

Applies quality adjustments through the Feature Switch API.

Example actions:

reduce particle density\
disable volumetric fog\
reduce device pixel ratio\
disable heavy post-processing

Typical degradation order:

1 reduce particles\
2 reduce DPR\
3 disable post-processing

------------------------------------------------------------------------

# Particle Budget Guidelines

Showcase:

400--600 particles

Balanced:

200--350 particles

Performance:

80--150 particles

Survival:

\<50 particles

Particles are visually impactful but GPU expensive.

------------------------------------------------------------------------

# Performance Logging

Each quality change should be logged.

Example log:

\[12:41:02\]

fps: 42 previousLevel: Q1 newLevel: Q2

actions: - particles 1.0 → 0.6 - fog high → medium

Logs may later be analyzed by AI advisory tools.

------------------------------------------------------------------------

# Debug Overlay (Optional)

Developer overlay may display:

• current quality level • FPS • frame time • particle count • active
effects

Useful during development and tuning.

------------------------------------------------------------------------

# Runtime Integration

SDI Lite depends on:

• Metrics Monitor • Feature Switch API

It must remain **external to the scene logic**, acting only through
control interfaces.

------------------------------------------------------------------------

# Future Extensions

Potential upgrades:

• AI performance advisor • device-specific tuning • automatic quality
presets

AI should remain **an advisory layer**, not part of the runtime loop.

------------------------------------------------------------------------

# Design Goal

SDI Lite acts as:

> the silent guardian of cinematic performance.

------------------------------------------------------------------------

END OF DOCUMENT