import { BaseFields, CONFIGURABLE_MODEL_FIELDS } from "@/model";
import { PrefixedConfigurables } from "@/model/types";
import { WorkflowState, WorkflowUpdate } from "@/schemas";
import { callModel } from "@/utils";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { initChatModel } from "langchain"
import * as logger from "@/utils/debugger"


export type PublisherConfigFields = PrefixedConfigurables<"publisher", BaseFields>

type PublisherConfig = RunnableConfig & {
    configurable?: PublisherConfigFields
}


const model = await initChatModel("qwen3.5:4b", {
    modelProvider: "ollama",
    configPrefix: "publisher",
    configurableFields: CONFIGURABLE_MODEL_FIELDS
})


const publisherPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a Senior Software Engineer, and you are to validate both answers of [STUDENT] and [PROFESSOR], while applying your own unique, practical perspective as a Senior Software Engineer. Answer in no more than 7 sentences. Prepend your answer with the string `[ENGINEER]: `"],
    ["human", "{messages}"]
])


export const publisherNode = async (state: WorkflowState, config: PublisherConfig): Promise<WorkflowUpdate> => {
    // console.log("Publisher node running...");
    // console.log("messages", state.messages)

    const prompt = await publisherPrompt.formatMessages({
        messages: state.messages
    })

    // logger.deferLog("config.configurable?.publisher_streaming", config.configurable?.publisher_streaming)
    const response = await callModel(model, prompt, config, "publisher")

    return {
        messages: [response]
    }
};
