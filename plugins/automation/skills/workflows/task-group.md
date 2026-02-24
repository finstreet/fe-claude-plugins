# Task Group Workflow

End-to-end orchestration for creating a task group feature.

## Input

You will receive one of:
- A reference to a context file: `./context/{parentPath}/{featureName}Context.md`
- A `subtaskId` — call `get_subtask_by_id` to fetch context
- Direct arguments via $ARGUMENTS: featureName, parentPath, and any additional context

## Steps

### Step 1: Add translations

Invoke the `automation:next-intl` skill. ALWAYS pass the following information:

- metadata

The skill will add the correct translations for the task group. If using a context file, tell the skill to add a `Translations` section at the end of the context file. Otherwise update the subtask content with the added translations so that other steps can make use of it.

### Step 2: Implement the task group

Invoke the `automation:task-group` skill. It contains the complete guide for implementing task groups. Follow the order from the skill and create ALL necessary files. ALWAYS pass the following information:

- subtask_id (or context file reference)
- featureName
- featureType
- product (optional)
- role (optional)
- List of all files created previously

### Step 3: Mark completion

If using a context file, mark the plan as completed inside the `Status` section at the end of the file.

## Rules

1. Execute steps sequentially — each step depends on the previous (unless parallelism is explicitly allowed)
2. Always pass prior findings (paths, created files, translations) to subsequent steps
3. Each step must update its context source with its findings
