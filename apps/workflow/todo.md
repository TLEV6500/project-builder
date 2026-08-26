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

## 🧪 Validation & Refinement
- [ ] Refactor `GraphConfig` to source model configurations (API keys, Base URLs, Model names) from environment variables instead of hardcoded literals.
- [ ] End-to-end validation of the Sandbox $\rightarrow$ Publisher handoff:
    - Verify file structure matches generated plan.
    - Ensure sandbox paths are correctly passed to the publisher.
    - Confirm `gh` CLI successfully pushes the sandbox content.

## 💻 Integration & CLI
- [x] Update `src/index.ts` to handle interactive CLI inputs (prompting for tech stack, infra, etc.) instead of a single one-way question.
- [x] Implement validation for user inputs before passing them to the `planner` node.
