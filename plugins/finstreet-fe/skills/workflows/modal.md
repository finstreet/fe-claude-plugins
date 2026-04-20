# Modal Workflow

End-to-end orchestration for creating a modal feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, metadata

## Steps

### Step 1: Implement the modal

Invoke the `finstreet-fe:modal` skill to implement everything that is needed for the modal. ALWAYS pass the following information:

- subtask_id
- featureName
- subFeatureName
- featureType
- product (optional)
- role (optional)

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
