# List Actions Workflow

End-to-end orchestration for creating list actions (pagination) for an interactive list.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, metadata

## Steps

### Step 1: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. The skill should return one feature path for each interactiveList item. ALWAYS pass the following information:

- featureName (the name of the task)
- subFeatureName (the name of the list)
- INTERACTIVE_LIST (you always pass this since we need the path to the interactiveList)
- product (optional)
- role (optional)

### Step 2: Add translations

Spawn a `general-purpose-agent` with the following context and instructions:

#### Context

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)
- metadata
- content: ALWAYS pass the full content that you receive from the subtask. Do NOT add anything else, just pass this down.

#### Instructions

You MUST use the `next-intl-skill` to add the correct translations for the list actions and update the subtask content with its findings after it is done.

### Step 3: Implement the pagination

Get the interactive list pagination documentation from the `get_list_actions` tool. Follow the order from the documentation and create ALL necessary files in sequence. You ALWAYS spawn one `list-actions-agent` for each file. Spawn all of these subagents in sequence — never in parallel. You will run one `list-actions-agent` for each step (the number of interactiveLists does not matter — the agents will handle multiple lists just fine). ALWAYS run one agent for each step.

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
4. Use the `get_list_actions` tool to get documentation topics:
   ```json
   { "topics": ["overview"] }
   ```
