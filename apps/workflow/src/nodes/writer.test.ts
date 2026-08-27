import { describe, it, expect, mock } from "bun:test";
import { writerNode } from "./writer";
import { WorkflowState } from "../schemas/WorkflowState";
import * as fs from "node:fs/promises";
import * as os from "node:os";

mock.module("node:fs/promises", () => ({
    mkdir: mock(() => Promise.resolve()),
    writeFile: mock(() => Promise.resolve()),
}));

describe("writerNode", () => {
    const mockState: WorkflowState = {
        messages: [],
        project: {
            name: "test-project",
            techStack: "TypeScript",
            isPrivate: false,
            repoUrl: null,
            structure: [
                { path: "src/index.ts", description: "Entry", content: "console.log(1)", type: "file" },
                { path: "docs", description: "Docs", type: "directory" },
                { path: "docs/readme.md", description: "Readme", content: "# Hello", type: "file" },
            ],
        },
        user: {
            name: "Test User",
            email: "test@example.com"
        }
    };

    it("should create files and directories based on project structure", async () => {
        const result = await writerNode(mockState, {});
        
        expect(result.project.sandbox?.status).toBe("completed");
        expect(result.project.sandbox?.rootPath).toContain(os.tmpdir());
        expect(fs.mkdir).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should return error if structure is missing", async () => {
        const stateWithoutStructure = { ...mockState, project: { ...mockState.project, structure: undefined } };
        const result = await writerNode(stateWithoutStructure, {});
        
        expect(result.messages[0].content).toContain("No project structure found");
    });
});
