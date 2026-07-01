## `# 1. Purpose` 

```
The Experience Profile defines how a specific experience interprets the generic
SoundBehaviorState provided by the Sound Behavior Layer.
```

```
While the Sound Behavior Layer describes semantic states of the experience,
the Experience Profile determines how those semantics are translated into
an actual audiovisual composition for a particular project.
```

```
This document intentionally separates **semantic meaning** from
**experience-specific interpretation**.
```

```
The same SoundBehaviorState may therefore produce different audible results
depending on the active Experience Profile.
```

```
For example:
```

- `SURREAL EXP LAB FOLIO` 

- `SURREAL INFINITY` 

- `ARG Field Runtime` 

- `Interactive Installation` 

- `Client Production` 

```
may all consume the same SoundBehaviorState while presenting entirely different
audio experiences.
```

```
The Experience Profile is therefore considered an orchestration layer rather
than part of the Sound Behavior Layer itself.
```

## `# 2. Scope` 

```
The Experience Profile is responsible for translating semantic behavior into
an experience-specific playback strategy.
```

```
It defines **what should be perceived by the visitor**, while leaving
implementation details to the Audio Runtime.
```

```
The Experience Profile may:
```

- `interpret one or more semantic layers simultaneously` 

- `suppress selected semantic layers` 

- `replace one semantic layer with another` 

- `introduce project-specific playback rules` 

- `determine which layers are audible in a given experience context` 

- `define experience-specific combinations of audio layers` 

```
The Experience Profile does **not**:
```

- `generate SoundBehaviorState` 

- `modify semantic layer values` 

- `manage playback devices` 

- `schedule audio playback` 

- `perform transitions or crossfades` 

- `apply DSP processing` 

- `manage gain, filters or spatialization` 

- `load or stream audio assets` 

```
Those responsibilities belong to the Audio Runtime and its selected backend.
```

```
Likewise, the Experience Profile must never redefine the meaning of
SoundBehaviorState. Semantic interpretation remains the responsibility of the
Sound Behavior Layer.
```

```
The Experience Profile only decides how those semantics are presented within
```

```
a specific experience.
```

```
The Experience Profile is considered replaceable.
```

```
Multiple Experience Profiles may coexist while sharing the same
SoundBehaviorState and Audio Runtime.
```

## `# 3. Architectural Principle` 

```
The Experience Profile is an orchestration layer.
```

```
It does not define semantic behavior, nor does it perform audio playback.
Instead, it translates semantic intent into an experience-specific presentation.
```

```
This separation ensures that:
```

```
- semantic meaning remains stable across all experiences
```

```
- playback technology remains interchangeable
```

```
- individual experiences retain full artistic freedom
```

```
The Experience Profile therefore acts as a bridge between semantic state and
runtime execution.
```

## `## Core Law` 

```
Semantic meaning belongs to the Sound Behavior Layer.
```

```
Experience interpretation belongs to the Experience Profile.
```

```
Playback execution belongs to the Audio Runtime.
```

## `## Architectural Independence` 

```
The Experience Profile must remain independent from playback implementation.
```

```
It must not contain backend-specific behavior or assumptions about
HTMLAudio, Web Audio API, FMOD, Wwise, or any future playback technology.
```

```
Its output represents an orchestration strategy rather than playback commands.
```

## `## Dramaturgical Independence` 

```
The Experience Profile may intentionally suppress, combine, replace or extend
semantic layers in order to achieve the desired dramaturgy of a specific
experience.
```

```
These decisions do not alter the meaning of the underlying
SoundBehaviorState.
```

```
They only influence how the visitor perceives that state.
```

```
# 4. Normative Requirements
```

```
The following requirements define the architectural contract of the
Experience Profile.
```

## `## EP-001 — Interpretation Layer` 

```
The Experience Profile **MUST** consume an existing `SoundBehaviorState`
and produce an experience-specific orchestration strategy.
```

```
It must not generate semantic behavior on its own.
```

```
---
```

```
## EP-002 — Semantic Preservation
```

```
The Experience Profile **MUST NOT** redefine, reinterpret or modify the
semantic meaning of any field contained within `SoundBehaviorState`.
```

```
Semantic ownership belongs exclusively to the Sound Behavior Layer.
```

```
---
```

```
## EP-003 — Runtime Independence
```

```
The Experience Profile **MUST** remain independent from any playback backend.
```

```
It must not contain implementation logic specific to HTMLAudio,
Web Audio API, FMOD, Wwise or any other audio technology.
```

```
---
```

```
## EP-004 — Playback Agnostic
```

```
The Experience Profile **MUST NOT** perform playback.
```

```
Responsibilities such as scheduling, synchronization, looping,
crossfading, gain control, filtering, spatialization or asset loading
belong exclusively to the Audio Runtime.
```

```
---
```

```
## EP-005 — Experience Ownership
```

```
Each experience **MAY** define its own Experience Profile while sharing
the same SoundBehaviorState and Audio Runtime.
```

```
Multiple Experience Profiles are expected to coexist within the same
Template Kit architecture.
```

```
---
```

```
## EP-006 — Layer Orchestration
```

```
The Experience Profile **MAY**:
```

- `suppress semantic layers` 

- `combine multiple semantic layers` 

- `replace one audible layer with another` 

- `introduce project-specific playback combinations` 

- `define context-sensitive orchestration rules` 

```
These decisions affect presentation only and must never alter semantic
meaning.
```

```
---
```

```
## EP-007 — Replaceability
```

```
The Experience Profile **MUST** be considered replaceable.
```

```
Changing the active Experience Profile must not require changes to:
```

- `SoundBehaviorState` 

- `Sound Behavior Layer` 

- `Audio Runtime` 

- `Audio Backend` 

```
Only the orchestration strategy should change.
```

```
---
```

## `## EP-008 — Deterministic Output` 

```
For a given SoundBehaviorState, the Experience Profile **MUST**
produce a deterministic orchestration result.
```

```
The same semantic state must always resolve to the same experience
presentation unless explicitly configured otherwise by the experience.
```

## `## EP-009 — Experience-Specific Rules` 

```
Experience-specific dramaturgical decisions belong exclusively to the
Experience Profile.
```

```
Examples include:
```

- `muting ambient during Project Card inspection` 

- `replacing Exploration with IR Exploration` 

- `playing CTA without ambient support` 

- `combining Probe layers during Scan` 

```
These rules are not part of the generic Sound Behavior Layer and must
not be promoted to semantic behavior.
```

```
# 5. Notes
```

```
## 5.1 FOLIO-first implementation
```

```
The current Experience Profile implementation is intentionally tailored to
SURREAL EXP LAB FOLIO v1.
```

```
Its purpose is to validate the architectural split between:
```

- `Sound Behavior Layer` 

- `Experience Profile` 

- `Audio Runtime` 

```
before generalizing the approach into the Template Kit.
```

```
---
```

```
## 5.2 Experience Profiles are project-specific
```

```
Experience Profiles are not intended to be universal.
```

```
Different projects may implement entirely different playback strategies while
consuming the same SoundBehaviorState.
```

```
Examples:
```

- `SURREAL EXP LAB FOLIO` 

- `SURREAL INFINITY` 

- `Client Presentations` 

- `Interactive Installations` 

```
Each project may define its own audible interpretation.
```

```
---
```

```
## 5.3 Probe-centric sound design
```

```
In FOLIO, Focus audio represents the state of the observation tool rather than
the surrounding world.
```

```
Examples:
```

- `SCAN_PROFILE` 

- `IR_PROFILE` 

- `future diagnostic layers` 

```
These sounds communicate what the Probe is doing, not what the environment is.
```

```
---
```

```
## 5.4 World-centric sound design
```

```
Ambient and Section layers communicate the current state of the world.
```

```
Examples:
```

```
Ambient
```

```
- VOID
```

```
- IR
```

```
Section
```

- `Exploration` 

- `Project Card` 

- `CTA` 

```
The world continues to exist independently of Probe operations.
```

```
---
```

```
## 5.5 HTMLAudio is an implementation detail
```

```
This specification does not require any playback technology.
```

```
Possible implementations include:
```

```
- HTMLAudio
```

- `Web Audio API` 

```
- FMOD
```

- `Wwise` 

- `custom native runtime` 

```
Any backend is valid if it reproduces the Experience Profile semantics.
```

```
---
```

```
## 5.6 Audio assets are outside this specification
```

```
This document never specifies:
```

```
- filenames
```

- `codecs` 

- `looping methods` 

- `gain values` 

- `filters` 

- `transition timing` 

```
Those belong to the Audio Runtime.
```

```
---
```

## `## 5.7 Future evolution` 

```
Future Audio Runtime versions may introduce:
```

- `Audio Banks` 

- `WebAudio routing` 

- `DSP filters` 

- `Crossfades` 

- `Ducking` 

- `Voice limiting` 

- `Spatial rendering` 

- `Timeline sequencing` 

```
These extensions must preserve the public Experience Profile contract.
```

```
---
```

## `## 5.8 Design philosophy` 

```
The listener should perceive a coherent acoustic space rather than a collection
of independent sound effects.
```

```
Experience Profiles exist to preserve dramaturgy while keeping the underlying
architecture modular.
```

## `# 6. Future Considerations` 

```
The Experience Profile architecture is intentionally designed as an extensible
orchestration layer.
```

```
Future revisions may expand the playback capabilities without changing the
relationship between SoundBehaviorState, Experience Profile, and Audio Runtime.
```

```
---
```

```
## 6.1 Web Audio Runtime
```

```
A future Audio Runtime may replace the HTMLAudio backend with a Web Audio API
implementation.
```

```
Expected benefits include:
```

- `gain automation` 

- `smooth crossfades` 

- `filter processing` 

- `dynamic routing` 

- `parameter modulation` 

- `lower playback latency` 

```
No changes to Experience Profile semantics should be required.
```

## `---` 

```
## 6.2 Audio Banks
```

```
Large collections of short sound effects should be organized into Audio Banks.
Instead of referencing many individual files, the runtime may resolve events
through timestamp metadata.
```

```
Example:
```

```
```
```

```
transition_bank.ogg
transition_bank.json
```
```

```
```json
{
  "SCAN_ENTER": [0.00, 0.82],
  "IR_ENTER": [0.83, 1.56],
  "CTA_ENTER": [1.57, 2.11]
}
```
```

```
This approach reduces asset management overhead while improving playback
efficiency.
```

```
---
```

```
## 6.3 Experience Mix Presets
```

```
Projects may expose multiple Experience Profiles.
```

```
Examples:
```

- `Cinematic` 

- `Minimal` 

```
- Atmospheric
```

```
- Exhibition
```

- `Silent` 

- `Accessibility` 

```
Each preset may reinterpret the same SoundBehaviorState without modifying its
semantic meaning.
```

```
---
```

```
## 6.4 Adaptive Mixing
```

```
Future runtimes may react dynamically to runtime conditions.
```

```
Possible inputs include:
```

- `user activity` 

- `interaction density` 

- `session duration` 

- `navigation speed` 

- `device capabilities` 

```
Playback may adapt automatically while preserving the Experience Profile
contract.
```

```
---
```

```
## 6.5 Dynamic Parameter Automation
```

```
Experience Profiles may evolve from selecting audio layers to driving audio
parameters.
```

```
Examples:
```

- `filter cutoff` 

- `reverb amount` 

- `stereo width` 

- `playback rate` 

- `modulation depth` 

- `spatial spread` 

```
These parameters remain an implementation concern of the Audio Runtime.
```

```
---
```

```
## 6.6 Spatial Audio
```

```
Future implementations may position audio sources within the 3D scene.
```

```
Possible use cases include:
```

- `localized artifacts` 

- `environmental emitters` 

- `portal ambience` 

- `navigation beacons` 

- `distant structures` 

```
Spatial rendering should extend, not replace, the Experience Profile model.
```

```
---
```

```
## 6.7 Runtime Diagnostics
```

```
Audio Runtime may expose diagnostic information for development builds.
```

```
Possible metrics:
```

- `active channels` 

- `active Experience Profile` 

- `active backend` 

- `loaded banks` 

- `playing voices` 

- `trigger history` 

- `CPU usage` 

- `memory usage` 

```
These diagnostics should remain optional and never affect playback behavior.
```

```
---
```

```
## 6.8 Template Kit Integration
```

```
Experience Profiles are expected to become a reusable module within the
SURREAL Template Kit.
```

```
Projects should be able to:
```

- `define custom Experience Profiles` 

- `register their own audio palettes` 

- `replace the Audio Runtime backend` 

- `preserve compatibility with SoundBehaviorState` 

```
The architectural contract established by SPEC_013, SPEC_014 and SPEC_015
should remain stable across Template Kit releases.
```

