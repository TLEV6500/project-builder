import { describe, it, expect, mock } from "bun:test";
import { plannerNode } from "./planner";
import { WorkflowState } from "../schemas/WorkflowState";
import { HumanMessage } from "langchain";

// Mock the callModel utility to avoid actual LLM calls
mock.module("@/utils", () => ({
    callModel: mock(() => Promise.resolve(JSON.stringify({
        structure: [
            { path: "src/index.ts", description: "Entry point", content: "console.log('hello')", type: "file" },
            { path: "package.json", description: "Package config", content: "{}", type: "file" }
        ],
        infrastructure: { target: "Vercel", config: {} },
        architecturalNotes: "Simple Node.js app"
    })))
}));

describe("plannerNode", () => {
    const mockState: WorkflowState = {
        messages: [new HumanMessage("Build a simple app")],
        project: {
            name: "test-project",
            techStack: "TypeScript",
            isPrivate: false,
            repoUrl: null,
        },
        user: {
            name: "Test User",
            email: "test@example.com"
        }
    };

    it("should successfully parse a valid JSON blueprint from the model", async () => {
        const result = await plannerNode(mockState, {});

        expect(result?.project?.structure).toBeDefined();
        expect(result?.project?.structure?.at(0)?.path).toBe("src/index.ts");
        expect(result?.project?.infrastructure?.target).toBe("Vercel");
        expect(result?.project?.architecturalNotes).toBe("Simple Node.js app");
        expect(result?.messages).toBeDefined();
    });

    it("should return an error message when the model returns invalid JSON", async () => {
        // Temporarily override the mock for this specific test
        const { callModel } = await import("@/utils");
        // Use type assertion to avoid any
        const originalImpl = (callModel as unknown as { getMockImplementation: () => unknown }).getMockImplementation();
        (callModel as unknown as { mockImplementationOnce: (fn: () => Promise<string>) => void }).mockImplementationOnce(() => Promise.resolve("Invalid JSON response"));

        const result = await plannerNode(mockState, {});

        expect((result?.messages as string[])[0]).toContain("Failed to generate a valid project blueprint");
        expect(result?.project).toBeUndefined();

        // Restore original implementation
        (callModel as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(originalImpl);
    });
});
