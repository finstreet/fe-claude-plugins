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

Invoke the `automation:next-intl` skill. ALWAYS pass the following information:

- metadata

The skill will add the correct translations for the list actions and update the subtask content with its findings after it is done. Your ONLY task in this step is to add the translations. DO NOT make any other changes! You are DONE with this step after the translations have been added and the subtask content has been updated.

### Step 3: Implement the pagination

Invoke the `automation:list-actions` skill. It contains the complete guide for implementing list actions and pagination. Follow the order from the skill and create ALL necessary files. ALWAYS pass the following information:

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)
- List of all files created previously

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
