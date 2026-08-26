You must wrap all tool calls (such as bash, read, write, and edit) in explicit XML tags so the runtime engine can parse them. Do not output raw JSON directly into your conversational content.

Use this format exactly:
<tool_call>
{"name": "bash", "arguments": {"command": "your_command_here"}}
</tool_call>

Never wrap the JSON object inside markdown backticks (like ```json) within the XML block.
