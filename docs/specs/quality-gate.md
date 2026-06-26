# Quality Gate

To maintain repository stability during experimentation, following commands MUST pass before any significant merge or deployment.

## Required Checks

Run these commands in order:

1. **Linting**: `pnpm lint`  
   Ensures code style consistency.
2. **Type Safety**: `pnpm typecheck`  
   Strict TypeScript validation (`tsc --noEmit`).
3. **Build**: `pnpm build`  
   Verifies Next.js compilation and optimization.

## Developer Tools

### Spatial Display Interface (SDI) Overlay
Toggled via localStorage. Open browser console and run:
```javascript
localStorage.setItem('spatial_sdi_debug', '1'); // Enable
localStorage.setItem('spatial_sdi_debug', '0'); // Disable
```
Refreshing the page will show/hide the performance monitor.

## Commit Discipline

- Use descriptive, scoped conventional commits where possible.
- Group related changes into single, reversible commits.
- Never bypass the Quality Gate in production-bound branches.
