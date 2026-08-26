import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import * as logger from "./debugger";
import { CONFIGURABLE_FIELDS, prefixField, PrefixField } from "@/model/types";


let modelOutputTokenCount = { response: 0, reasoning: 0 }

/**
 * 1. Repurposed Atomic Event Dispatcher
 * Manages the formatting and writing of incoming chunk components to stdout.
 */
function dispatchChunkToken(chunk: AIMessageChunk, streamOption: "response" | "reasoning" | "all" | "none"): void {
    // 1. Cast securely to bypass strict top-level compiler constraints
    const rawChunk = chunk;

    // 2. Extract Reasoning/Thinking tokens
    // Handles LangChain's unified field paths, fallback to additional metadata
    // const reasoningText = rawChunk.additional_kwargs?.reasoning_content as string

    // if (reasoningText && typeof reasoningText === "string") {
    //     process.stdout.write(`\x1b[33m${reasoningText}\x1b[0m`, "utf8"); // Gold text for thinking
    // }

    // 3. Fallback check for systems utilizing structured content blocks array
    if (Array.isArray(rawChunk.contentBlocks)) {
        for (const block of rawChunk.contentBlocks) {
            // logger.deferLog("block.type", block.type)
            // logger.deferLog("block", block)

            if (block.type === "reasoning" && block.reasoning) {
                // logger.deferLog("block.reasoning", block.reasoning)
                // logger.deferLog("[\"none\", \"response\"].includes(streamOption)", ["none", "response"].includes(streamOption))
                // logger.deferLog("streamOption", streamOption)
                if (["none", "response"].includes(streamOption)) {
                    if (modelOutputTokenCount.reasoning % 100 === 0) process.stdout.write("\b \b|")
                    else if (modelOutputTokenCount.reasoning === 0) process.stdout.write("|")
                    else if (modelOutputTokenCount.reasoning % 50 === 0) process.stdout.write("\b \b—")
                    modelOutputTokenCount.reasoning++
                }
                if (["reasoning", "all"].includes(streamOption)) {
                    process.stdout.write(`\x1b[33m${block.reasoning}\x1b[0m`, "utf8");
                }
            }
            else if (["text", "text-plain"].includes(block.type) && block.text) {
                // logger.deferLog("block.text", block.text)
                if (modelOutputTokenCount.response === 0) {
                    process.stdout.write("\n\n")
                }
                if (["response", "all"].includes(streamOption)) {
                    modelOutputTokenCount.response++
                    process.stdout.write((block.text as string), "utf8");
                }
            }
        }
    }

    // 4. Extract standard text completion response tokens
    // if (streamOption === "none" && chunk.content) {
    //     const text = typeof chunk.content === "string"
    //         ? chunk.content
    //         : JSON.stringify(chunk.content);
    //     process.stdout.write(text, "utf8");
    // }
}

/**
 * 2. Repurposed Atomic Stream Consumer
 * Iterates through the native chat model chunk stream, dispatches them to stdout,
 * and builds up the final full text response string.
 */
async function consumeNodeModelStream(
    chunkStream: AsyncIterable<AIMessageChunk>,
    onChunkProcessed: (chunk: AIMessageChunk) => void
): Promise<string> {
    let accumulatedText = "";

    for await (const chunk of chunkStream) {
        // Accumulate contents securely
        if (chunk.content && typeof chunk.content === "string") {
            accumulatedText += chunk.content;
        }

        // Forward the piece downstream to handle printing actions
        onChunkProcessed(chunk);
    }

    return accumulatedText;
}

/**
 * 3. Atomic Node Orchestration Controller
 * The main wrapper utility you will import inside your graph nodes.
 */
export async function callModel(modelInstance: BaseLanguageModel, messages: BaseMessage[], config: RunnableConfig, prefix?: string): Promise<string> {
    const streamOption: "response" | "reasoning" | "all" | "none" = config.configurable ? config.configurable[prefixField(prefix, CONFIGURABLE_FIELDS.STREAMING)] : "response"
    let finalResultText: string
    console.write("\n\nThinking...")
    modelOutputTokenCount.response = modelOutputTokenCount.reasoning = 0
    if (streamOption === "none") {
        const chunk = await modelInstance.invoke(messages, config) as AIMessageChunk
        finalResultText = chunk.text
    }
    else {
        const chunkStream = await modelInstance.stream(messages, config);

        finalResultText = await consumeNodeModelStream(chunkStream, (chunk) => {
            dispatchChunkToken(chunk, streamOption);
        });

    }

    if (logger.getQueueSize()) {
        console.log("Debug Log:")
        logger.printLogs()
    }

    return finalResultText;
}
