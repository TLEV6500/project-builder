import { BaseFields, CONFIGURABLE_MODEL_FIELDS } from "@/model";
import { PrefixedConfigurables } from "@/model/types";
import { WorkflowState, WorkflowUpdate } from "@/schemas";
import { RunnableConfig } from "@langchain/core/runnables";
import { initChatModel } from "langchain"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { callModel } from "@/utils";
import * as logger from "@/utils/debugger";


export type PlannerConfigFields = PrefixedConfigurables<"planner", BaseFields>

type PlannerConfig = RunnableConfig & {
    configurable?: PlannerConfigFields
}


const model = await initChatModel("qwen3.5:4b", {
    modelProvider: "ollama",
    configPrefix: "planner",
    configurableFields: CONFIGURABLE_MODEL_FIELDS
})


const plannerPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a computer science student answering a person's query about computer science, as provided by the [PERSON] key. Your answer should be under 7 sentences. Prepend your answer with the string `[STUDENT]: `"],
    ["human", "{messages}"]
])


export const plannerNode = async (state: WorkflowState, config: PlannerConfig): Promise<WorkflowUpdate> => {
    // console.log("Planner node running...");
    // console.log("messages", state.messages)

    const prompt = await plannerPrompt.formatMessages({
        messages: state.messages.map(msg => msg.content)
    })

    // logger.deferLog("config.configurable?.planner_streaming", config.configurable?.planner_streaming)
    const response = await callModel(model, prompt, config, "planner")

    return {
        messages: [response]
    }
};
