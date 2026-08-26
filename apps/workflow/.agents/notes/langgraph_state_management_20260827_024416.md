# Research Notes: langgraph state management

## Findings
- **Persistence/Checkpointers**: LangGraph uses checkpointers to save snapshots of the state. This is required for interrupts to work. Each state is tracked by a `thread_id`.
- **Interrupt Mechanisms**:
    - `interrupt()`: Modern approach. Called inside a node to pause and return a value to the client. The graph pauses until the user provides input via `invoke` or a `Command` object.
    - `interrupt_before` / `interrupt_after`: Configuration-based breakpoints. The graph stops exactly before or after the specified node.
- **Resuming State**: When resuming, the user can provide new state updates that are merged into the existing snapshot before the graph continues.
- **Re-execution**: Nodes that already completed are skipped (cached), but the node where the interrupt happened (or subsequent nodes) will re-execute.
- **Workflow Implications**: For our project, we can use a `thread_id` to maintain a session with the user, use `interrupt_before` the `writer` node to let the user approve the project plan, and update the state with user feedback before resuming.

## Sources
- LangChain Documentation: Interrupts
- LangGraph Concept Guide: Human-in-the-loop
- LangGraph GitHub: Breakpoints Docs
- LangChain Documentation: Checkpointers
