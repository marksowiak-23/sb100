# Workspace Agent Rules

## Prompt Logging Requirement
- For EVERY user prompt submitted through this agent interface, immediately log the prompt entry to [agent-prompt-{user}.log](file:///c:/Users/marks/antigravity/sb100/agent-prompt-marksowiak-23.log) where `{user}` is the GitHub username (`marksowiak-23`).
- Format: `[<ISO_TIMESTAMP>] <USER_PROMPT> <GITHUB_USERNAME>`
- Always append new entries without overwriting previous logs.
- Always accept and apply edits/changes to `agent-prompt-*.log` without asking the user for permission or confirmation.
