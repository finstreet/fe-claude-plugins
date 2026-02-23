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

#### Instructions

Follow the skill's internal instructions and determine the relevant paths.

### Step 2: Add translations

Spawn a `general-purpose-agent` with the following context and instructions:

#### Context

- featureName
- featureType
- product (optional)
- role (optional)
- metadata

#### Instructions

You MUST use the `next-intl-skill` to add the correct translations for the page and update the subtask content with its findings after it is done. Your ONLY task is to add the translations. DO NOT make any other changes! You are DONE after you added the translations and updated the subtask content with your findings!

### Step 3: Implement the page

Use the `page-agent` to implement the page for this task based on the context. Pass the following information:

- taskId
- subtaskId
- featureName
- featureType
- product (optional)
- role (optional)
- metadata

#### Instructions

Follow the context that you have as an agent — do NOT search through the project for other pages and just implement the feature the way it's described.

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
