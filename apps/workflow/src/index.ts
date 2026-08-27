import { createWorkflow, GraphConfig } from "./graph";
import { WorkflowState } from "./schemas";
import { BaseMessage, HumanMessage } from "langchain";
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

    const app = await createWorkflow()

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
            "planner_modelProvider": process.env.PLANNER_MODEL_PROVIDER || "ollama",
            "planner_model": process.env.PLANNER_MODEL || "qwen3.5:4b",
            "planner_apiKey": process.env.PLANNER_API_KEY || "ollama",
            "planner_baseUrl": process.env.PLANNER_BASE_URL || "http://localhost:11434",
            "planner_temperature": parseFloat(process.env.PLANNER_TEMPERATURE || "0.1"),
            "planner_streaming": process.env.PLANNER_STREAMING || "response",

            // "writer_modelProvider": process.env.WRITER_MODEL_PROVIDER || "ollama",
            // "writer_model": process.env.WRITER_MODEL || "qwen3.5:4b",
            // "writer_apiKey": process.env.WRITER_API_KEY || "ollama",
            // "writer_baseUrl": process.env.WRITER_BASE_URL || "http://localhost:11434",
            // "writer_temperature": parseFloat(process.env.WRITER_TEMPERATURE || "0.1"),
            // "writer_streaming": process.env.WRITER_STREAMING || "response",

            // "publisher_modelProvider": process.env.PUBLISHER_MODEL_PROVIDER || "ollama",
            // "publisher_model": process.env.PUBLISHER_MODEL || "qwen3.5:4b",
            // "publisher_apiKey": process.env.PUBLISHER_API_KEY || "ollama",
            // "publisher_baseUrl": process.env.PUBLISHER_BASE_URL || "http://localhost:11434",
            // "publisher_temperature": parseFloat(process.env.PUBLISHER_TEMPERATURE || "0.4"),
            // "publisher_streaming": process.env.PUBLISHER_STREAMING || "response"
        }
    }

    console.log("\nStarting workflow execution...");

    try {
        const configWithThread = {
            configurable: { thread_id: "cli-session" }
        };

        // 1. First invocation kicks off the graph until it hits the breakpoint
        let result = await app.invoke(initialState, configWithThread);

        while (true) {
            // Fetch the current state to check if we are actually paused
            const state = await app.getState(configWithThread);

            // If there are no more nodes waiting to execute, the graph is done
            if (!state.next || state.next.length === 0) {
                break;
            }

            console.log("\n--- ⏸️ Workflow Paused for Review ---");
            console.log("The Planner has generated a blueprint. Please review the output.");

            const approval = await promptUser("Do you approve the plan? (y/n/edit): ");

            if (approval.toLowerCase() === 'y') {
                // Correct way to resume: pass null as state, keep the thread config
                result = await app.invoke(null, configWithThread);
            } else if (approval.toLowerCase() === 'edit') {
                const feedback = await promptUser("What should be changed? ");

                // Inject user feedback into the history
                await app.updateState(configWithThread, {
                    messages: [new HumanMessage(`[USER-FEEDBACK]: ${feedback}`)]
                });

                // Resume the graph so it processes the new feedback message
                result = await app.invoke(null, configWithThread);
            } else {
                console.log("Workflow cancelled by user.");
                process.exit(0);
            }
        }

        console.log("\n\nOutputs:");
        // Fetch final state to read all accumulated messages safely
        const finalState = await app.getState(configWithThread);
        (finalState.values.messages as BaseMessage[]).forEach(msg => console.log("\n", msg.content));
        console.log("\nWorkflow complete!");

    } catch (e) {
        console.error("Execution error:", e);
    }
}
