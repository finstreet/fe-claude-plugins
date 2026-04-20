# Secure Fetch Workflow

End-to-end orchestration for creating secure fetch (API request) features.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, featureType, product, role, metadata with request paths)
- Direct arguments via $ARGUMENTS: featureName, featureType, product, role, request paths

## Steps

### Step 1: Create all request schemas and endpoint configs

Follow the order of the `Request Paths` from the metadata to create ALL necessary schemas and requests. For each request path, invoke the `finstreet-fe:secure-fetch` skill with the following information:

- ALL metadata fields from this request (this contains the endpoint)

ONLY pass the information above and do not add anything else. Invoke the skill for each request in sequence — NEVER in parallel.

### Step 2: Update task context with usage documentation

After ALL other steps are done, use the `mcp__plugin_automation_context-forge-mcp__update_task_context` tool to update the task context so that further subtasks have access to the context.

ALWAYS follow the response format below. You only write what's in the response format! Do NOT leave anything out or ADD anything that is not requested.

#### Response format

```
# Endpoint name

- Example usage on a page and inside a form so that it's clear for following steps how to use these requests
- Example usage for the endpoint with example values for the pathVariables and the payload (if there is a payload)
```

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent steps
3. Each step must update subtask content with its findings
