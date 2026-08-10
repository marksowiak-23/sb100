# Workspace Agent Rules

## Prompt Logging Requirement
- For EVERY user prompt submitted through this agent interface, immediately log the prompt entry to [agent-prompt.log](file:///c:/Users/marks/antigravity/sb100/agent-prompt.log).
- Format: `[<ISO_TIMESTAMP>] <USER_PROMPT>`
- Always append new entries without overwriting previous logs.
