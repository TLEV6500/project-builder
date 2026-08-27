import { BaseFields, CONFIGURABLE_MODEL_FIELDS } from "@/model";
import { PrefixedConfigurables } from "@/model/types";
import { WorkflowState, WorkflowUpdate } from "@/schemas";
import { RunnableConfig } from "@langchain/core/runnables";
import { initChatModel } from "langchain"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { callModel } from "@/utils";
import * as z from "zod";

export type PlannerConfigFields = PrefixedConfigurables<"planner", BaseFields>

type PlannerConfig = RunnableConfig & {
    configurable?: PlannerConfigFields
}

const model = await initChatModel("qwen3.5:4b", {
    modelProvider: "ollama",
    configPrefix: "planner",
    configurableFields: CONFIGURABLE_MODEL_FIELDS
})

// Define a schema for the project blueprint
const BlueprintSchema = z.object({
    structure: z.array(z.object({
        path: z.string(),
        description: z.string(),
        content: z.string().optional(),
        type: z.enum(["file", "directory"]),
    })),
    infrastructure: z.object({
        target: z.string(),
        config: z.record(z.any(), z.any()),
    }),
    architecturalNotes: z.string(),
});

const plannerPrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert Software Architect. Your goal is to generate a detailed project blueprint based on the user's request.

    You must output your response as a valid JSON object that matches the following schema:

    ${JSON.stringify(BlueprintSchema.shape).replace(/{/g, '{{').replace(/}/g, '}}')}

    The blueprint should include:
    1. A complete file tree (structure) with paths and descriptions.
    2. The intended infrastructure target (e.g., "Vercel", "AWS", "Docker").
    3. Detailed architectural notes.

    Return ONLY the JSON object.`],
    ["human", "{messages}"]
])

export const plannerNode = async (state: WorkflowState, config: PlannerConfig): Promise<WorkflowUpdate> => {
    console.log("Planner node called")
    const prompt = await plannerPrompt.formatMessages({
        messages: state.messages.map(msg => msg.content)
    })

    // return value of `callModel` is the value of AIMessageChunk<MessageStructure<MessageToolSet>>["content"], which is the string form of the response already
    const response = await callModel(model, prompt, config, "planner")

    try {
        // Extract JSON from response (handling potential markdown blocks)
        const jsonText = response.replace(/```json\n?|```/g, "").trim();
        const blueprint = JSON.parse(jsonText);

        return {
            messages: [response],
            project: {
                ...state.project,
                structure: blueprint.structure,
                infrastructure: blueprint.infrastructure,
                architecturalNotes: blueprint.architecturalNotes,
            }
        }
    } catch (e: unknown) {
        console.error("Failed to parse blueprint JSON:", e);
        return {
            messages: ["Failed to generate a valid project blueprint. Please try again."]
        }
    }
};
