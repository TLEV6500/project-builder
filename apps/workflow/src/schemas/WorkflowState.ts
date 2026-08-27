import { MessagesValue, StateSchema } from "@langchain/langgraph";
import * as z from "zod"

export const WorkflowStateSchema = new StateSchema({
    messages: MessagesValue,
    project: z.object({
        name: z.string(),
        repoDescription: z.string().optional(),
        techStack: z.string(),
        architecturalNotes: z.string().optional(),
        isPrivate: z.boolean(),
        repoUrl: z.string().nullable(),
        // Project structure (file tree)
        structure: z.array(z.object({
            path: z.string(),
            description: z.string(),
            content: z.string().optional(),
            type: z.enum(["file", "directory"]),
        })).optional(),
        // Infrastructure target and deployment configurations
        infrastructure: z.object({
            target: z.string().optional(), // e.g., "Vercel", "AWS", "Docker"
            config: z.record(z.any(), z.any()).optional(),
        }).optional(),
        // Sandbox status and paths
        sandbox: z.object({
            status: z.enum(["idle", "active", "completed", "error"]).default("idle"),
            rootPath: z.string().nullable().optional(),
            sessionId: z.string().nullable().optional(),
            error: z.string().nullable().optional(),
        }).optional(),
    }),
    user: z.object({
        name: z.string(),
        email: z.email(),
    }),
})
export type WorkflowState = typeof WorkflowStateSchema.State
export type WorkflowUpdate = typeof WorkflowStateSchema.Update
