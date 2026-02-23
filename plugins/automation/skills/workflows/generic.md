# Generic Workflow

End-to-end orchestration for creating a generic feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, content, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, content, metadata

## Steps

### Step 1: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- subFeatureName (which is the name of the subtask)
- featureType
- product (optional)
- role (optional)

### Step 2: Implement requirements

ALWAYS spawn a `general-purpose-agent` for this task and give it the following context and instructions:

#### Context

- featureName
- subFeatureName
- featureType
- product (optional)
- role (optional)
- content
- metadata

#### Instructions

Follow the instructions in content and metadata to implement the needed changes.

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
