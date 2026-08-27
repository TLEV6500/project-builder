import { describe, it, expect, mock, spyOn } from "bun:test";
import { callModel } from "./streaming";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";

// Mocking the necessary types for AIMessageChunk
class MockAIMessageChunk extends AIMessageChunk {
    content: string;
    private _contentBlocks: any[];
    response_metadata: any;

    constructor(content: string, contentBlocks: any[] = [], provider: string = "test-provider") {
        super({ contentBlocks });
        this.content = content;
        this._contentBlocks = contentBlocks;
        this.response_metadata = { model_provider: provider };
    }

    get contentBlocks() {
        return this._contentBlocks;
    }
}

describe("src/utils/index.ts", () => {
    const mockMessages: BaseMessage[] = [{ content: "Hello", role: "user" } as any];
    const mockConfig: RunnableConfig = {
        configurable: {
            "streaming": "response" // Default prefix for test
        }
    };

    it("should handle streamOption 'none' (invoke)", async () => {
        const mockModel = {
            invoke: mock(async (messages, config) => {
                return { text: "Invoked response" } as any;
            }),
            stream: mock(async () => { }),
        } as unknown as BaseLanguageModel;

        // We need to override the prefixField/CONFIGURABLE_FIELDS if they are dynamic,
        // but since we control the config and callModel uses them internally,
        // we simulate 'none' by passing it in config.
        const configWithNone: RunnableConfig = {
            configurable: { "streaming": "none" }
        };

        // Note: callModel uses prefixField(prefix, CONFIGURABLE_FIELDS.STREAMING)
        // In the real code, CONFIGURABLE_FIELDS.STREAMING is likely "streaming"
        // and prefix is optional.

        const result = await callModel(mockModel, mockMessages, configWithNone);
        expect(result).toBe("Invoked response");
        expect(mockModel.invoke).toHaveBeenCalled();
    });

    it("should handle streaming response and accumulate text", async () => {
        const chunks = [
            new MockAIMessageChunk("Hello", [{ type: "text", text: "Hello" }]),
            new MockAIMessageChunk(" world", [{ type: "text", text: " world" }]),
        ];

        const mockModel = {
            invoke: mock(async () => { }),
            stream: mock(async () => {
                return (async function* () {
                    for (const chunk of chunks) yield chunk;
                })();
            }),
        } as unknown as BaseLanguageModel;

        // Spy on process.stdout.write to verify streaming output
        const stdoutSpy = spyOn(process.stdout, "write");

        const result = await callModel(mockModel, mockMessages, mockConfig);

        expect(result).toBe("Hello world");
        expect(stdoutSpy).toHaveBeenCalled();

        stdoutSpy.mockRestore();
    });

    it("should handle reasoning blocks and streaming options", async () => {
        const chunks = [
            new MockAIMessageChunk("", [{ type: "reasoning", reasoning: "Thinking..." }]),
            new MockAIMessageChunk("Answer", [{ type: "text", text: "Answer" }]),
        ];

        const mockModel = {
            invoke: mock(async () => { }),
            stream: mock(async () => {
                return (async function* () {
                    for (const chunk of chunks) yield chunk;
                })();
            }),
        } as unknown as BaseLanguageModel;

        const configWithAll: RunnableConfig = {
            configurable: { "streaming": "all" }
        };

        const stdoutSpy = spyOn(process.stdout, "write");

        const result = await callModel(mockModel, mockMessages, configWithAll);

        expect(result).toBe("Answer");
        // Verify reasoning was printed (yellow color code \x1b[33m)
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\x1b[33mThinking...\x1b[0m"), "utf8");

        stdoutSpy.mockRestore();
    });

    it("should correctly process streamOption 'reasoning' and not print final text", async () => {
        const chunks = [
            new MockAIMessageChunk("", [{ type: "reasoning", reasoning: "Only thinking" }]),
            new MockAIMessageChunk("Hidden", [{ type: "text", text: "Hidden" }]),
        ];

        const mockModel = {
            invoke: mock(async () => { }),
            stream: mock(async () => {
                return (async function* () {
                    for (const chunk of chunks) yield chunk;
                })();
            }),
        } as unknown as BaseLanguageModel;

        const configReasoning: RunnableConfig = {
            configurable: { "streaming": "reasoning" }
        };

        const stdoutSpy = spyOn(process.stdout, "write");

        await callModel(mockModel, mockMessages, configReasoning);

        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("\x1b[33mOnly thinking\x1b[0m"), "utf8");
        expect(stdoutSpy).not.toHaveBeenCalledWith("Hidden", "utf8");

        stdoutSpy.mockRestore();
    });
});
