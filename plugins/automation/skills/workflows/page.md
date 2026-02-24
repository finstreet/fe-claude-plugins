# Page Workflow

End-to-end orchestration for creating a page feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, featureType, product, role, metadata

## Steps

### Step 1: Determine routes

Invoke the `automation:routes` skill to determine the route of the page and add it to the `routes.ts` file. It will update the task context with the `update_task_context` tool with its findings after it is done. ALWAYS pass the following information:

- featureName
- featureType
- product (optional)
- role (optional)
- metadata

### Step 2: Add translations

Invoke the `automation:next-intl` skill. ALWAYS pass the following information:

- metadata

The skill will add the correct translations for the page and update the subtask content with its findings after it is done. Your ONLY task in this step is to add the translations. DO NOT make any other changes! You are DONE with this step after the translations have been added and the subtask content has been updated.

### Step 3: Implement the page

Invoke the `automation:page` skill to implement the page for this task based on the context. ALWAYS pass the following information:

- taskId
- subtaskId
- featureName
- featureType
- product (optional)
- role (optional)
- metadata

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
