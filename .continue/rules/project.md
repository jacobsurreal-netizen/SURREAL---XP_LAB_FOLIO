# Project architecture

This is a Next.js app router project.

## Structure
- app/: routes and layouts
- components/: reusable UI components
- hooks/: custom React hooks
- lib/: utilities and shared logic
- public/: static assets
- styles/: global and shared styling

## Coding rules
- Prefer minimal targeted edits over broad rewrites.
- Reuse existing utilities before adding new ones.
- Preserve current naming unless there is a clear bug or inconsistency.
- For multi-file changes, first explain the plan and list files to change.
- When debugging, trace from route/component entrypoint to helper functions.