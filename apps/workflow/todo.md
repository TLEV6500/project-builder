# Project Workflow Transformation Todo List

## 🛠️ Tooling & Infrastructure
- [x] Create progress logging scripts and directory structure for recording actions and research notes.

## 📚 Research & Discovery
- [x] Research LangGraph state management for multi-turn user interactions (interrupts/breakpoints) to collect tech stack and infra requirements.
- [x] Research secure sandbox environments for file system I/O (e.g., Docker, gVisor, or specialized Node.js sandbox libraries).
- [x] Study GitHub CLI (`gh`) documentation for repository creation, committing, and publishing via automation.

## 🏗️ Architecture & Schema
- [x] Redesign `WorkflowState` schema to include:
    - Project structure (file tree).
    - Architectural decisions.
    - Infrastructure target and deployment configurations.
    - Sandbox status/paths.

## ⚙️ Workflow Logic Changes
- [x] **Planner Node**: Update to generate a comprehensive project blueprint (files, dependencies, folder structure) instead of a simple text response.
- [x] **Writer Node**: Implement as a file-system executor that creates the project structure in the secure sandbox.
- [x] **Publisher Node**: Implement logic to interface with GitHub CLI for repo initialization, committing, and pushing.
- [x] **Graph Topology**: Convert the linear flow (`START` -> `planner` -> `writer` -> `publisher` -> `END`) to a conditional graph allowing user review/approval of the plan before execution.
- [ ] **Loopback Strategy**: Decide and implement the loopback mechanism:
    - Option A: `writer` $\rightarrow$ `planner` (after scaffolding is created but config files need content).
    - Option B: `publisher` $\rightarrow$ `planner` (for generating config contents before final push).
    - Ensure all loops are gated by user approval.
- [ ] **Autonomous Research**: Implement `researchNode` to give the `planner` node online researching capabilities.
- [ ] **Publication Approval**: Implement a final user approval step before the `publisher` node pushes to GitHub, allowing revisions to repo metadata.

## 🧪 Validation & Refinement
- [x] Refactor `GraphConfig` to source model configurations (API keys, Base URLs, Model names) from environment variables instead of hardcoded literals.
- [x] End-to-end validation of the Sandbox $\rightarrow$ Publisher handoff:
    - Verify file structure matches generated plan.
    - Ensure sandbox paths are correctly passed to the publisher.
    - Confirm `gh` CLI successfully pushes the sandbox content.
- [x] Implement unit tests for `plannerNode` using Bun test.
- [x] Implement unit tests for `writerNode` using Bun test.
- [x] Implement unit tests for `publisherNode` using Bun test.
- [x] Implement integration tests for the `createWorkflow` graph.
- [x] Fix type and linting errors identified by `bunx eslint .`.

### Technical Details

## 💻 Integration & CLI
- [x] Update `src/index.ts` to handle interactive CLI inputs (prompting for tech stack, infra, etc.) instead of a single one-way question.
- [x] Implement validation for user inputs before passing them to the `planner` node.


## SqliteSaver Database Problem
- [x] Investigate DB problem - **FOUND: Bun runtime incompatibility**
- [x] Research usage patterns - **Completed**
- [x] Thread_id verification - **Verified**


### ⏸️ MANUAL TESTING (WAITING FOR SIGNAL)
- [x] Run `bun src/index.ts` directly (no "workflow" script) at @apps/workflow/ — provide CLI inputs per @apps/workflow/logs/user-run-1.txt
  - Source inputs: apps/workflow/logs/user-run-1.txt
  - Status: **COMPLETED** — rerun with stdout recorded to apps/workflow/logs/direct-run-stdout.txt (77 bytes, timeout 124; prompts consumed input) `bun src/index.ts` with inputs from log — inputs piped from apps/workflow/logs/user-run-1.txt; `bun run workflow` script not found in package.json (no "workflow" script) — needs script mapping or `bun src/index.ts`

## 🐞 Bug Fixes
- [x] Investigate and fix streaming token output issues in the workflow.
- [x] Check `@src/utils/index.ts` for printing logic (`process.stdout.write` vs `console.log`).
- [x] Write a co-located test suite for `@src/utils/index.ts` using Bun test runner.
- [x] Fix reasoning token streaming: Reasoning blocks are not being printed to stdout.
- [x] Ensure `streamOption` logic correctly triggers reasoning and response printing.
