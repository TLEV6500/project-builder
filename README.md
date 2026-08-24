# project-builder

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Project Structure
- `./apps/*` are the main applications to be built and deployed in this project
- `./packages/*` are the shared packages used across the project by importing via their `package.json` exports and their package name as the import path, which uses the "@" prefix
- `./turbo.json` is the configuration file for Turbo, the build system used in this project
- `./packages/eslint-config` is the shared ESLint configuration used across the project
- `./packages/typescript-config` is the shared TypeScript configuration used across the project
- `./apps/workflow` is the main workflow application for the project
