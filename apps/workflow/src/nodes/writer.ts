import { BaseFields, CONFIGURABLE_MODEL_FIELDS } from "@/model";
import { PrefixedConfigurables } from "@/model/types";
import { WorkflowState, WorkflowUpdate } from "@/schemas";
import { callModel } from "@/utils";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { initChatModel } from "langchain"
import * as logger from "@/utils/debugger"


export type WriterConfigFields = PrefixedConfigurables<"writer", BaseFields>

type WriterConfig = RunnableConfig & {
    configurable?: WriterConfigFields
}


const model = await initChatModel("qwen3.5:4b", {
    modelProvider: "ollama",
    configPrefix: "writer",
    configurableFields: CONFIGURABLE_MODEL_FIELDS
})


const writerPrompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a computer science professor that will verify that the STUDENT has answered the PERSON's question correctly. If it wasn't correct or needs expanding on, provide your own answer in your own voice. Answer in no more than 7 sentences. Prepend your answer with the string `[PROFESSOR]: `"],
    ["human", "{messages}"]
])


export const writerNode = async (state: WorkflowState, config: WriterConfig): Promise<WorkflowUpdate> => {
    // console.log("Writer node running...");
    // console.log("messages", state.messages)

    const prompt = await writerPrompt.formatMessages({
        messages: state.messages
    })

    // logger.deferLog("config.configurable?.writer_streaming", config.configurable?.writer_streaming)
    const response = await callModel(model, prompt, config, "writer")

    return {
        messages: [response]
    }
};
