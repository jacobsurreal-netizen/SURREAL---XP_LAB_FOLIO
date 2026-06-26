# SPEC --- Experience Flow & Scene Lifecycle

SURREAL_EXP_LAB_FOLIO

Version: v0.1\
Purpose: Define the spatial experience structure, scene lifecycle
contract, node navigation model, and asset streaming strategy for the
SURREAL spatial runtime.

------------------------------------------------------------------------

# 1. Architectural Philosophy

SURREAL_EXP_LAB_FOLIO is designed as a **spatial web experience**, not a
traditional page-based website.

Navigation occurs through **spatial nodes and scene transitions**,
orchestrated by an experience controller rather than a page router.

Core principles:

• Spatial exploration instead of page navigation\
• Scene lifecycle management for modular environments\
• Node-based interaction architecture\
• Cinematic camera movement as primary navigation\
• Progressive asset streaming for performance

------------------------------------------------------------------------

# 2. System Layers

The spatial runtime is divided into four primary layers.

Application Layer\
Handles UI overlays, loading logic, and global state.

Experience Layer\
Controls navigation flow, transitions, and camera behavior.

World Layer\
Contains scene modules and spatial nodes.

Rendering Layer\
Manages the WebGL renderer, camera system, shaders, and post-processing.

------------------------------------------------------------------------

# 3. Scene-Based Architecture

Each spatial environment is encapsulated as a **Scene Module**.

Scenes are responsible only for their internal environment and objects.

Scenes follow a lifecycle contract:

init() update(delta) destroy()

Example structure:

EntryScene.init() EntryScene.update(delta) EntryScene.destroy()

LabScene.init() LabScene.update(delta) LabScene.destroy()

ProjectScene.init() ProjectScene.update(delta) ProjectScene.destroy()

Responsibilities:

init()\
• Load models and textures\
• Create lights and environment\
• Initialize interaction triggers

update(delta)\
• Animate objects\
• Update particles or shaders\
• Handle local interactions

destroy()\
• Dispose assets\
• Remove listeners\
• Free memory

------------------------------------------------------------------------

# 4. Node-Based Spatial Navigation

Navigation is built around **interaction nodes**, not pages.

Each node represents a meaningful spatial anchor in the world.

Node structure:

position\
cameraTarget\
interactionRadius\
sceneReference\
hudContext\
preloadHints

Defined navigation nodes:

Entry Node / ArtefactScene\
Identity Node / AboutLabScene\
Projects Node / ProjectFocusScene\
CTA Node / AmbientTransmitionScene\
Future Node / GatewayScene

Transitions occur through cinematic camera movement and scene
activation.

------------------------------------------------------------------------

# 5. Experience Controller

The ExperienceController orchestrates the spatial flow.

Responsibilities:

• Activate scene modules\
• Manage camera transitions\
• Trigger node interactions\
• Control HUD state\
• Coordinate asset streaming

Example transition flow:

User approaches node\
→ Node interaction triggers\
→ Camera transition begins\
→ Target scene initializes\
→ Previous scene cleans up

------------------------------------------------------------------------

# 6. Camera as Navigation

The camera is the primary navigation mechanism.

Common movements:

Orbit\
Dolly\
Focus\
Fly-through

Example actions:

focusArtifact() moveToNode() cinematicTransition()

This approach reinforces the feeling of moving through a digital
environment rather than browsing a website.

------------------------------------------------------------------------

# 7. Asset Streaming Strategy

Assets are loaded progressively to maintain performance.

Streaming tiers:

Boot Assets\
Required for initial entry scene.

Near Assets\
Assets likely needed next based on proximity.

Deep Assets\
Loaded only when entering specific scenes.

Example flow:

EntryScene assets\
↓\
LabScene assets preload\
↓\
ProjectScene assets on demand

------------------------------------------------------------------------

# 8. Recommended System Modules

Core runtime modules:

SceneManager\
ExperienceController\
NodeGraph\
CameraSystem\
AssetStreamer\
HUDController

This modular architecture ensures scalability while maintaining clear
system responsibilities.

------------------------------------------------------------------------

# 9. Design Philosophy

Spatial web experiences should follow **dramaturgical flow**, similar to
narrative structures.

Traditional storytelling uses:

Hero's Journey

Spatial experiences use:

Entry → Orientation → Discovery → Focus → Transition

The SURREAL system embraces this pattern as the foundation of immersive
navigation.
