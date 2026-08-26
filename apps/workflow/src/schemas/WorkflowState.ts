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
        repoUrl: z.string().nullable()
    }),
    user: z.object({
        name: z.string(),
        email: z.email(),
    }),
})
export type WorkflowState = typeof WorkflowStateSchema.State
export type WorkflowUpdate = typeof WorkflowStateSchema.Update
