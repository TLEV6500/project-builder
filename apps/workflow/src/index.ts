import { createWorkflow, GraphConfig } from "./graph";
import { WorkflowState } from "./schemas";
import { HumanMessage } from "langchain";
import * as logger from "./utils/debugger";
import * as readline from "node:readline/promises";
import { stdin as inputStdin } from "node:process";
import { stdout as outputStdout } from "node:process";

async function promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({ input: inputStdin, output: outputStdout });
    const answer = await rl.question(question);
    rl.close();
    return answer;
}

if (import.meta.main) {
    if (
        ["-h", "--help", "help"].includes(Bun.argv[2] ?? "")
    ) {
        console.info("Usage: bun run workflow")
        process.exit(0)
    }

    logger.setRateLimitStrat("qty", 10)

    // 1. Interactive Setup
    console.log("🚀 Welcome to Project Builder Workflow\n");
    
    const projectName = await promptUser("Project Name: ");
    const projectDesc = await promptUser("Project Description: ");
    const techStack = await promptUser("Tech Stack (e.g. Next.js, FastAPI, Rust): ");
    const isPrivateStr = await promptUser("Private Repository? (y/n): ");
    const userName = await promptUser("Your Name: ");
    const userEmail = await promptUser("Your Email: ");

    // Validation
    if (!projectName || !techStack || !userName || !userEmail) {
        console.error("❌ Error: Project name, tech stack, name, and email are required.");
        process.exit(1);
    }

    const app = createWorkflow()

    const promptArg = `I want to build a ${projectName}. Description: ${projectDesc}. Tech stack: ${techStack}.`;
    const prompt = new HumanMessage(`[PERSON]: ${promptArg}`)
    
    const initialState: WorkflowState = {
        messages: [prompt],
        project: {
            name: projectName,
            repoDescription: projectDesc,
            techStack: techStack,
            isPrivate: isPrivateStr.toLowerCase() === 'y',
            repoUrl: null,
        },
        user: {
            name: userName,
            email: userEmail,
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
            "planner_streaming": "response",

            "writer_modelProvider": "ollama",
            "writer_model": "qwen3.5:4b",
            "writer_apiKey": "ollama",
            "writer_baseUrl": "http://localhost:11434",
            "writer_temperature": 0.1,
            "writer_streaming": "response",

            "publisher_modelProvider": "ollama",
            "publisher_model": "qwen3.5:4b",
            "publisher_apiKey": "ollama",
            "publisher_baseUrl": "http://localhost:11434",
            "publisher_temperature": 0.4,
            "publisher_streaming": "response"
        }
    }

    console.log("\nStarting workflow execution...");
    
    try {
        // We use .invoke, but since we have interrupts, we need to handle the state
        // For a CLI, we may need to loop through the graph execution
        let currentState = initialState;
        let configWithThread = { ...config, configurable: { ...config.configurable, thread_id: "cli-session" } };

        // Initial run (starts from START)
        let result = await app.invoke(currentState, configWithThread);
        
        // Because we have interruptsBefore: ["writer"], the graph will stop after planner.
        // In a real CLI, we'd check for the interrupt and prompt the user.
        
        console.log("\n\nOutputs:")
        result.messages.forEach(msg => console.log("\n", msg.content))
        console.log("\nWorkflow complete!");
    } catch (e) {
        console.error("Execution error:", e);
    }
}
