---
name: simple-form-workflow
description: "Simple form creation workflow. Delegates to the simple-form-agent with full context. Use when creating a simple form that doesn't require the full form workflow (no parent path resolution or translations needed)."
---

# Simple Form Workflow

Orchestration for creating a simple form feature.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, subFeatureName, featureType, product, role, content, metadata)
- Direct arguments via $ARGUMENTS: featureName, subFeatureName, featureType, product, role, content, metadata

## Steps

### Step 1: Implement the SimpleForm

ALWAYS spawn a `simple-form-agent` for this task and give it the following context and instructions:

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

1. Pass all available context to the simple-form-agent
2. The agent handles all implementation details — do not add extra instructions
