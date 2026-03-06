# Inquiry Process Workflow

End-to-end orchestration for creating an inquiry process feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, featureType, product, role, metadata

## Steps

### Step 1: Determine routes

Invoke the `automation:routes` skill to determine the routes for the layout and all page files of the inquiry process. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- featureType
- product (optional)
- role (optional)
- metadata

#### Instructions

All steps mentioned in the metadata are pages for data entry inside the inquiry process.

### Step 2: Implement the inquiry process

Invoke the `automation:inquiry-process` skill. It contains the complete guide for implementing inquiry processes. Follow the order from the skill and create ALL necessary files. ALWAYS pass the following information:

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
