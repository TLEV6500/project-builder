import { describe, it, expect, mock, beforeAll, afterAll } from "bun:test";
import { publisherNode } from "./publisher";
import { WorkflowState } from "../schemas/WorkflowState";
import { execSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

mock.module("node:child_process", () => ({
    execSync: mock(() => Buffer.from("success")),
}));

describe("publisherNode", () => {
    let tempDir: string;

    beforeAll(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pub-test-"));
    });

    afterAll(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    const getMockState = (rootPath?: string): WorkflowState => ({
        messages: [],
        project: {
            name: "test-repo",
            techStack: "TS",
            isPrivate: false,
            repoUrl: null,
            sandbox: {
                status: "completed",
                rootPath: rootPath || tempDir,
            }
        },
        user: {
            name: "Test User",
            email: "test@example.com"
        }
    });

    it("should execute git and gh commands to publish the repo", async () => {
        const state = getMockState();
        const result = await publisherNode(state, {});
        
        expect(result.messages[0].content).toContain("successfully published");
        expect(execSync).toHaveBeenCalledWith("git init", expect.anything());
        expect(execSync).toHaveBeenCalledWith("git add .", expect.anything());
        expect(execSync).toHaveBeenCalledWith(expect.stringContaining("gh repo create"), expect.anything());
    });

    it("should return error if sandbox rootPath is missing", async () => {
        const state = { 
            ...getMockState(), 
            project: { ...getMockState().project, sandbox: { status: "idle", rootPath: null } } 
        };
        const result = await publisherNode(state, {});
        
        expect(result.messages[0].content).toContain("No sandbox path found");
    });
});
