# Interactive List Workflow

End-to-end orchestration for creating an interactive list feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role

## Steps

### Step 1: Get parent paths

Invoke the `finstreet-fe:path-resolver` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- subFeatureName (which is the name of the subtask)
- featureType
- product (optional)
- role (optional)

### Step 2: Implement the InteractiveList

Invoke the `finstreet-fe:ui` skill to build the InteractiveList. ALWAYS pass the following information:

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)

The file path for the interactiveList is `{featurePath}/{FeatureName}PresentationList.tsx`.

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
