---
name: form-workflow
description: "End-to-end form creation workflow. Resolves parent directories, adds translations, creates all form files sequentially, and updates task context. Use when creating a complete form feature from scratch."
---

# Form Workflow

End-to-end orchestration for creating a form feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role

## Steps

### Step 1: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- subFeatureName (which is the name of the subtask)
- featureType
- product (optional)
- role (optional)

### Step 2: Add translations

Spawn a `general-purpose-agent` with the following context and instructions:

#### Context

- metadata

#### Instructions

You MUST use the `next-intl-skill` to add the correct translations for the form and update the subtask content with its findings after it is done. Your ONLY task is to add the translations. DO NOT make any other changes! You are DONE after you added the translations and updated the subtask content with your findings!

### Step 3: Implement the form

Get the form documentation from the `get_forms_documentation` tool. Follow the order from the documentation and create ALL necessary files in sequence for the form. You ALWAYS spawn one `form-agent` for each file. Spawn all of these subagents in sequence — never in parallel. You will run one `form-agent` for each step.

Pass the following to each `form-agent`:

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

### Step 4: Update task context with usage documentation

Spawn a `general-purpose-agent` after ALL other tasks are done. Give the agent the following instructions:

#### Instructions

1. Gather information about all files created for this form (look at the featurePath and the files created in this directory)
2. Use the `mcp__plugin_automation_context-forge-mcp__update_task_context` tool to update the task context so that further subtasks have access to the context
3. ALWAYS follow the response format! You only write what's in the response format! Do NOT leave anything out or ADD anything that is not requested

#### Response format

```
# How to use the form

- Write a short guide where to find the {Name}Form.tsx component
- Add the parameters that have to be passed for it to be usable
```

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
4. Use the `get_forms_documentation` tool to get documentation topics:
   ```json
   { "topics": ["overview"] }
   ```
