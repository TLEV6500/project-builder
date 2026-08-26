import { createWorkflow, GraphConfig } from "./graph";
import { WorkflowState } from "./schemas";
import { HumanMessage } from "langchain";
import * as logger from "./utils/debugger";


if (import.meta.main) {
    if (
        ["-h", "--help", "help"].includes(Bun.argv[2] ?? "")
        || !["response", "reasoning", "all", "none"].includes(Bun.argv[2] ?? "")
    ) {
        console.info("Usage: bun run workflow [<stream:response|reasoning|all|none>=response] [<prompt>=\"What is computer science?\"]")
        process.exit(0)
    }

    logger.setRateLimitStrat("qty", 10)

    const app = createWorkflow()

    let whatToStream = Bun.argv[2] || "response"
    const promptArg = Bun.argv[3] || "What is computer science?"
    const prompt = new HumanMessage(`[PERSON]: ${promptArg}`)
    const initialState: WorkflowState = {
        messages: [prompt],
        project: {
            name: "Boilerplate Project",
            techStack: "TypeScript",
            isPrivate: true,
            repoUrl: null,
        },
        user: {
            name: "Developer",
            email: "dev@example.com",
        },
    };

    const config: GraphConfig = {
        version: "v2",
        encoding: "text/event-stream",
        configurable: {
            "planner_modelProvider": "ollama",
            "planner_model": "qwen3.5:4b",
            "planner_apiKey": "ollama",
            "planner_baseUrl": "http://localhost:11434",
            "planner_temperature": 0.1,
            "planner_streaming": whatToStream,

            "writer_modelProvider": "ollama",
            "writer_model": "qwen3.5:4b",
            "writer_apiKey": "ollama",
            "writer_baseUrl": "http://localhost:11434",
            "writer_temperature": 0.1,
            "writer_streaming": whatToStream,

            "publisher_modelProvider": "ollama",
            "publisher_model": "qwen3.5:4b",
            "publisher_apiKey": "ollama",
            "publisher_baseUrl": "http://localhost:11434",
            "publisher_temperature": 0.4,
            "publisher_streaming": whatToStream
        }
    }

    console.log("Starting workflow execution...");
    console.log(`First message: ${initialState.messages[0]?.text}`)
    const finalResult = await app.invoke(initialState, config)
    console.log("\n\nOutputs:")
    finalResult.messages.forEach(msg => console.log("\n", msg.content))
    console.log("\nWorkflow complete!");
}
