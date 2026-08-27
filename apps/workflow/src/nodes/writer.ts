import { BaseFields } from "@/model";
import { PrefixedConfigurables } from "@/model/types";
import { WorkflowState, WorkflowUpdate } from "@/schemas";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export type WriterConfigFields = PrefixedConfigurables<"writer", BaseFields>

export const writerNode = async (state: WorkflowState): Promise<WorkflowUpdate> => {
    console.log("Writer node called")

    if (!state.project.structure) {
        return {
            messages: [{ content: "No project structure found. Planner must run first.", role: "assistant" }]
        }
    }

    // Create a secure temporary directory for the sandbox
    const sandboxRoot = path.join(os.tmpdir(), `workflow-sandbox-${Date.now()}`);
    await fs.mkdir(sandboxRoot, { recursive: true });

    try {
        for (const item of state.project.structure) {
            const fullPath = path.join(sandboxRoot, item.path);

            if (item.type === "directory") {
                await fs.mkdir(fullPath, { recursive: true });
            } else {
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                if (item.content) {
                    await fs.writeFile(fullPath, item.content);
                } else {
                    await fs.writeFile(fullPath, `// ${item.description}`);
                }
            }
        }

        return {
            messages: [{ content: `Project files successfully created in sandbox: ${sandboxRoot}`, role: "assistant" }],
            project: {
                ...state.project,
                sandbox: {
                    status: "completed",
                    rootPath: sandboxRoot,
                    sessionId: `session-${Date.now()}`,
                }
            }
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Writer Error:", error);
        return {
            messages: [{ content: `Error writing files: ${errorMessage}`, role: "assistant" }],
            project: {
                ...state.project,
                sandbox: {
                    status: "error",
                    error: errorMessage,
                }
            }
        }
    }
};
