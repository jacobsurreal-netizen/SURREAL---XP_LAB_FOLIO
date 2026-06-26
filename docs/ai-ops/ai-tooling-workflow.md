

## SURREAL AI DEVELOPMENT WORKFLOW
Continue · Ollama · GitLens
This document defines the AI-assisted development workflow used in the Surreal
ExpLab projects.
It serves as a reference anchor for all AI assistants interacting with the
repository.
The goal is to ensure:
- consistent AI behavior
- safe multi-file edits
- predictable debugging workflow
- minimal code disruption

## 1. System Overview
This project uses a local AI development stack built around:
## Tool Purpose
Continue (VS Code) AI coding interface
Ollama Local LLM runtime
Qwen2.5-Coder Primary coding model
Nomic Embed Text Codebase embeddings
GitLens Git history + context
Plan Mode Repository analysis
## Agent Mode
Controlled multi-file
editing
The system is designed to work locally without external APIs.


## 2. Model Architecture
AI models run locally through Ollama.
Primary coding model
qwen2.5-coder:3b
Used for:
- code explanation
- debugging
- small refactors
- structured edits
Embedding model
nomic-embed-text
Used for:
- semantic search
- code navigation
- contextual prompts

## 3. Continue Configuration
The configuration is stored in:
%USERPROFILE%\.continue\config.yaml
Example configuration:
name: Local Config
version: 1.0.0
schema: v1

models:
- name: Qwen Coder 3B
provider: ollama

model: qwen2.5-coder:3b
apiBase: http://localhost:11434
roles:
- chat
- edit
- apply
capabilities:
- tool_use

- name: Embed
provider: ollama
model: nomic-embed-text
apiBase: http://localhost:11434
roles:
- embed

## 4. Continue Modes
Continue operates in three primary modes.
## Chat Mode
Used for:
- explanations
- brainstorming
- architecture discussion
Chat mode does not modify files.

## Plan Mode
Used for codebase exploration.
Plan mode can:
- read files
- search repository
- analyze architecture

Plan mode must never modify files.
Typical prompts:
Trace the architecture of the hero section.
List all relevant files.
Do not modify anything.

## Agent Mode
Agent mode performs controlled edits.
Capabilities include:
- multi-file refactors
- bug fixes
- code cleanup
- commit suggestions
Agent mode must follow repository rules.

- AI Rules
Project-specific rules are stored in:
## .continue/rules/
## Files:
## .continue/rules/project.md
## .continue/rules/workflow.md
These rules define:
- project architecture
- coding conventions
- editing workflow
- safety constraints
AI agents must always follow these rules.


- Standard AI Workflow
Every AI-assisted task must follow this sequence.
## Step 1 — Plan
AI analyzes the repository.
Example prompt:
Analyze the current project structure and identify where the hero section is
assembled.
Do not modify files yet.
Provide a plan.

## Step 2 — Review
Human developer reviews the plan.
Possible actions:
- approve
- adjust
- reject

## Step 3 — Agent Execution
AI performs edits only after approval.
Example prompt:
Execute the approved plan.
Make the smallest safe changes across all necessary files.
Avoid unrelated edits.


## Step 4 — Commit Message
AI generates commit metadata.
Example output:
fix(hero): correct camera framing for hero asset

Adjusted frameObject parameters to prevent clipping on initial load.

## Step 5 — Test Plan
AI suggests a manual verification plan.
## Example:
- Start dev server
- Load landing page
- Verify hero asset appears centered
- Confirm orbit controls still function

## 7. Editing Rules
AI must always follow these rules.
## Allowed
- minimal targeted edits
- bug fixes
- small refactors
- documentation improvements
## Avoid
- large rewrites
- renaming architecture without reason
- formatting-only changes
- touching unrelated files


## 8. Debugging Strategy
AI debugging must follow the architecture flow.
route
→ component
→ hook
→ utility
→ runtime system
## Example:
app/page.tsx
→ components/Hero
→ hooks/useCamera
→ lib/cameraUtils
AI should trace issues from entrypoint downward.

## 9. Git Integration
Git history is explored through GitLens.
AI may inspect:
- commit history
- blame information
- change context
## However:
AI must not rewrite history.

## 10. Safety Guidelines
AI must always:
- prefer minimal changes

- preserve architecture
- ask for clarification when uncertain
- propose plan before edits
AI must never:
- run destructive commands
- delete core systems
- rewrite major subsystems without approval

- Recommended AI Prompts
Architecture exploration
Trace the architecture of the hero section and list all related files.
Bug investigation
Find the root cause of the hero asset rendering issue.
Inspect related files first and propose a minimal fix.
Refactor request
Reduce duplication in the hero rendering system while keeping behavior unchanged.
List files before editing.

## 12. Limitations
The current local model:
Qwen2.5-Coder 3B
has limited context and reasoning compared to large cloud models.
## Therefore:
- tasks should be broken into smaller steps
- Plan mode should be used frequently

- rules help reduce hallucinations

- Role of Human Developer
The developer remains responsible for:
- architectural decisions
- approving changes
- validating runtime behavior
AI is used as a development assistant, not an autonomous agent.

End of Document
