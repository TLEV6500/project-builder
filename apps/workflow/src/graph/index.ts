import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { plannerNode, writerNode, publisherNode } from "@/nodes/index";
import { WorkflowStateSchema } from "@/schemas";
import { PlannerConfigFields } from "../nodes/planner";
import { WriterConfigFields } from "../nodes/writer";
import { PublisherConfigFields } from "../nodes/publisher";
import { RunnableConfig } from "@langchain/core/runnables";

type AllConfigurableFields = PlannerConfigFields & WriterConfigFields & PublisherConfigFields;

export type GraphConfig = RunnableConfig & {
    configurable: AllConfigurableFields
} & {
    version: "v1" | "v2",
    encoding: "text/event-stream"
}

const checkpointer = new MemorySaver()

export const createWorkflow = async () => {
    console.log("Creating workflow...")

    const workflow = new StateGraph(WorkflowStateSchema)
        .addNode("planner", plannerNode)
        .addNode("writer", writerNode)
        .addNode("publisher", publisherNode)

        .addEdge(START, "planner")
        // In a real scenario, we would add a conditional edge here for user approval
        // For now, we implement the logic requested but keep it as a flow that
        // the user can interrupt via LangGraph breakpoints.
        .addEdge("planner", "writer")
        .addEdge("writer", "publisher")
        .addEdge("publisher", END);

    return workflow.compile({
        checkpointer,
        interruptBefore: ["writer"]
    });
};
