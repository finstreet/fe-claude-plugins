# Task Group Workflow

End-to-end orchestration for creating a task group feature.

## Input

You will receive one of:
- A reference to a context file: `./context/{parentPath}/{featureName}Context.md`
- A `subtaskId` — call `get_subtask_by_id` to fetch context
- Direct arguments via $ARGUMENTS: featureName, parentPath, and any additional context

## Steps

### Step 1: Get documentation

Call the `get_task_group` tool with the `overview` topic to understand the task group structure and required files.

```json
{ "topics": ["overview"] }
```

### Step 2: Add translations

ALWAYS start with the `next-intl-agent` to get the correct translations for the task group. Give the `next-intl-agent` the instruction to add a `Translations` section at the end of the context file (if using a context file) or update the subtask content with the added translations so that other agents can make use of it.

### Step 3: Implement the task group

Follow the order from the documentation and create ALL necessary files in sequence. For each file YOU HAVE to spawn one `task-group-agent`. If otherwise mentioned in your information you may spawn these subagents in parallel as well.

ALWAYS pass a reference to the context source (either the `./context/{parentPath}/{featureName}Context.md` file or the subtask_id) to ALL subagents.

### Step 4: Mark completion

If using a context file, mark the plan as completed inside the `Status` section at the end of the file.

## Rules

1. Execute steps sequentially — each step depends on the previous (unless parallelism is explicitly allowed)
2. Always pass prior findings (paths, created files, translations) to subsequent agents
3. Each agent must update its context source with its findings
