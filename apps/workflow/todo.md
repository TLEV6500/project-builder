# Project Workflow Transformation Todo List

## 📚 Research & Discovery
- [ ] Research LangGraph state management for multi-turn user interactions (interrupts/breakpoints) to collect tech stack and infra requirements.
- [ ] Research secure sandbox environments for file system I/O (e.g., Docker, gVisor, or specialized Node.js sandbox libraries).
- [ ] Study GitHub CLI (`gh`) documentation for repository creation, committing, and publishing via automation.

## 🏗️ Architecture & Schema
- [ ] Redesign `WorkflowState` schema to include:
    - Project structure (file tree).
    - Architectural decisions.
    - Infrastructure target and deployment configurations.
    - Sandbox status/paths.

## ⚙️ Workflow Logic Changes
- [ ] **Planner Node**: Update to generate a comprehensive project blueprint (files, dependencies, folder structure) instead of a simple text response.
- [ ] **Writer Node**: Implement as a file-system executor that creates the project structure in the secure sandbox.
- [ ] **Publisher Node**: Implement logic to interface with GitHub CLI for repo initialization, committing, and pushing.
- [ ] **Graph Topology**: Convert the linear flow (`START` -> `planner` -> `writer` -> `publisher` -> `END`) to a conditional graph allowing user review/approval of the plan before execution.

## 💻 Integration & CLI
- [ ] Update `src/index.ts` to handle interactive CLI inputs (prompting for tech stack, infra, etc.) instead of a single one-way question.
- [ ] Implement validation for user inputs before passing them to the `planner` node.
