# Form Workflow

End-to-end orchestration for creating a form feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role

## Steps

### Step 1: Implement the form

Invoke the `automation:form` skill. It contains the complete guide for implementing forms using `@finstreet/forms`. Follow the file creation order from the skill exactly and create ALL necessary files. ALWAYS pass the following information:

- subtask_id
- featureName
- subFeatureName
- featureType
- product (optional)
- role (optional)
- List of all files created previously

ALWAYS tell the skill to follow these rules:
- you can create all files in parallel

### Step 2: Update task context with usage documentation

After ALL other steps are done, use the `mcp__plugin_automation_context-forge-mcp__update_task_context` tool to update the task context so that further subtasks have access to the context.

ALWAYS follow the response format below. You only write what's in the response format! Do NOT leave anything out or ADD anything that is not requested.

#### Response format

```
# How to use the form

- Write a short guide where to find the {Name}Form.tsx component
- Add the parameters that have to be passed for it to be usable

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
