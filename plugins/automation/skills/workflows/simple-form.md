# Simple Form Workflow

Orchestration for creating a simple form feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, content, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, content, metadata

## Steps

### Step 1: Implement the SimpleForm

Invoke the `automation:simple-form` skill. ALWAYS pass the following information:

- featureName
- subFeatureName
- featureType
- product (optional)
- role (optional)
- content
- metadata

Follow the instructions in content and metadata to implement the needed changes.

## Rules

1. Pass all available context to the skill
2. The skill handles all implementation details — do not add extra instructions
