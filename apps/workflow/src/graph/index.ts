import { StateGraph, START, END, PregelOptions } from "@langchain/langgraph";
import { plannerNode, writerNode, publisherNode } from "@/nodes/index";
import { WorkflowState, WorkflowStateSchema } from "@/schemas";
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


export const createWorkflow = () => {
    console.log("Creating workflow...")

    const workflow = new StateGraph(WorkflowStateSchema)
        .addNode("planner", plannerNode)
        .addNode("writer", writerNode)
        .addNode("publisher", publisherNode)

        .addEdge(START, "planner")
        .addEdge("planner", "writer")
        .addEdge("writer", "publisher")
        .addEdge("publisher", END);

    return workflow.compile();
};
