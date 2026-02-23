---
name: modal-workflow
description: "End-to-end modal creation workflow. Resolves parent directories, adds translations, and creates the modal component. Use when creating a complete modal feature from scratch."
---

# Modal Workflow

End-to-end orchestration for creating a modal feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, metadata

## Steps

### Step 1: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- subFeatureName (which is the name of the subtask)
- featureType
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

You MUST use the `next-intl-skill` to add the correct translations for the modal and update the subtask content with its findings after it is done.

### Step 3: Implement the modal

Spawn a `modal-agent` to implement everything that is needed for the modal. Always pass the following information:

#### Context

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
