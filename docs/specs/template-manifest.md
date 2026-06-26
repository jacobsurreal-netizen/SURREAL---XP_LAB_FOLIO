*SURREAL Spatial Web Template Kit* *  * * Author: Jacob Surreal*

  
*Version: v0.1 *  
*Status: Foundation Freeze*  
*\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_*  

  
  
*\# Purpose*  
  
*This template provides a \*\*stable foundation for building spatial web experiences\*\**  
*using:*  
  
*- Next.js*  
*- React*  
*- Three.js*  
*- TypeScript*  
  
*It defines a \*\*minimal runtime architecture\*\* that supports:*  
  
*- WebGL rendering*  
*- asset loading*  
*- spatial scene logic*  
*- HUD overlays*  
*- future interaction systems*  
  
*\-\--*  
  
*\# Core Runtime Features*  
  
*The template guarantees the following working systems:*  
  
*\### Rendering Pipeline*  
  
*Three.js renderer mounted inside React lifecycle.*  
  
*Capabilities:*  
  
*- WebGL canvas lifecycle management*  
*- scene initialization*  
*- camera setup*  
*- animation loop*  
*- resize handling*  
  
*\-\--*  
  
*\### Spatial Scene Adapter*  
  
*File:*  

*src/scene/three-adapter.tsx*

*Responsibilities:*  
  
*- create Three scene*  
*- initialize camera*  
*- create renderer*  
*- attach canvas to DOM*  
*- manage animation loop*  
*- handle cleanup on unmount*  
  
*\-\--*  
  
*\### HUD Overlay System*  
  
*File:*  

*src/hud/hud-skeleton.tsx*

*Responsibilities:*  
  
*- overlay UI above WebGL canvas*  
*- support debug / IR modes*  
*- isolate UI layer from render layer*  
  
*HUD can be \*\*disabled without breaking runtime\*\*.*  
  
*\-\--*  
  
*\### Runtime Separation*  
  
*Architecture separates:*  

*Rendering Layer*  
* Scene Logic*  
* HUD / Interface*  
* Future Systems*

*Directory layout:*  

*src/*  
* scene/*  
* hud/*  
* runtime/*  
* sdi/*  
* template-kit/*

*\-\--*  
  
*\# Verified Runtime State*  
  
*Template verified with:*  

*pnpm build*  
* pnpm dev*  
* pnpm exec tsc \--noEmit*

*Successful output:*  
  
*- no TypeScript errors*  
*- successful production build*  
*- clean git status*  
*- rotating Three.js torus smoke test*  
  
*\-\--*  
  
*\# Smoke Test*  
  
*The template includes a minimal scene test:*  
  
*- animated torus mesh*  
*- black background*  
*- no HUD interference*  
  
*Purpose:*  

*confirm renderer*  
* confirm animation loop*  
* confirm React mount lifecycle*

*\-\--*  
  
*\# Usage*  
  
*Clone template:*  

*git clone \<repo\>*  
* pnpm install*  
* pnpm dev*

*Expected result:*  

*rotating torus visible in browser*

*\-\--*  
  
*\# Intended Use*  
  
*Template is designed for:*  
  
*- spatial portfolios*  
*- 3D product experiences*  
*- WebGL storytelling*  
*- interactive installations*  
*- creative coding environments*  
  
*\-\--*  
  
*\# Future Extensions*  
  
*Planned systems:*  
  
*- GLB asset pipeline*  
*- spatial anchor system*  
*- navigation system*  
*- interaction layer*  
*- performance governor*  
*- asset streaming*  
*- multi-scene orchestration*  
  
*\-\--*  
  
*\# Versioning*  

*v0.1 -- foundation runtime*  
* v0.2 -- asset pipeline*  
* v0.3 -- spatial navigation*  
* v0.4 -- production runtime*

*\-\--*  
  
*\# Philosophy*  
  
*The template prioritizes:*  

*clarity*  
* separation of systems*  
* minimal runtime coupling*  
* future extensibility*

*\-\--*  
  
*\# Status*  
  
*Foundation complete.*  
  
*Template safe to use as base for new spatial web projects.*
