---
name: inquiry-process-workflow
description: "End-to-end inquiry process creation workflow. Determines routes, resolves parent directories, adds translations, and creates all inquiry process files sequentially. Use when creating a complete inquiry process feature from scratch."
---

# Inquiry Process Workflow

End-to-end orchestration for creating an inquiry process feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, featureType, product, role, metadata

## Steps

### Step 1: Determine routes

Invoke the `automation:routes` skill to determine the routes for the layout and all page files of the inquiry process. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- featureType
- product (optional)
- role (optional)
- metadata

#### Instructions

All steps mentioned in the metadata are pages for data entry inside the inquiry process.

### Step 2: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- featureType
- product (optional)
- role (optional)

### Step 3: Add translations

Spawn a `general-purpose-agent` with the following context and instructions:

#### Context

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)

#### Instructions

You MUST use the `next-intl-skill` to add the correct translations for the inquiry process and update the subtask content with its findings after it is done.

### Step 4: Implement the inquiry process

Get the inquiry process overview documentation from the `get_inquiry_process` tool. Follow the order from the documentation and create ALL necessary files in sequence. You ALWAYS spawn one `inquiry-process-agent` for each file. Spawn all of these subagents in sequence — never in parallel. ALWAYS pass this to the subagents:

#### Context

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)

#### Files created

- List all files that were created previously

#### Instructions

- ONLY mention which file to create! Do NOT give any other instructions as the subagent will receive them from the respective tool calls

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
4. Use the `get_inquiry_process` tool to get documentation topics:
   ```json
   { "topics": ["overview"] }
   ```
