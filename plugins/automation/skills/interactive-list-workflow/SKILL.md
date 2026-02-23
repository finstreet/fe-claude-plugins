---
name: interactive-list-workflow
description: "End-to-end interactive list creation workflow. Resolves parent directories, adds translations, and creates the InteractiveList component. Use when creating a complete interactive list feature from scratch."
---

# Interactive List Workflow

End-to-end orchestration for creating an interactive list feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role

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

#### Instructions

You MUST use the `next-intl-skill` to add the correct translations for the interactive list and update the subtask content with its findings after it is done.

### Step 3: Implement the InteractiveList

Spawn the `ui-agent` with the following context and instructions:

#### Context

- subtask_id
- featureName
- featureType
- product (optional)
- role (optional)

#### Instructions

Your task is to build an `InteractiveList` based on the context that you received. The file path for the interactiveList is `{featurePath}/{FeatureName}PresentationList.tsx`.

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
