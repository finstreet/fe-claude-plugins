# Secure Fetch Workflow

End-to-end orchestration for creating secure fetch (API request) features.

## Input

You will receive one of:
- A `subtaskId` — call `get_subtask_by_id` to fetch context (featureName, featureType, product, role, metadata with request paths)
- Direct arguments via $ARGUMENTS: featureName, featureType, product, role, request paths

## Steps

### Step 1: Get parent paths

Invoke the `automation:parent-directory` skill to resolve the correct paths for this feature. It will update the subtask content with its findings after it is done. ALWAYS pass the following information:

- featureName
- featureType
- product (optional)
- role (optional)

### Step 2: Create all request schemas and endpoint configs

Follow the order of the `Request Paths` from the metadata to create ALL necessary schemas and requests. You ALWAYS spawn one `secure-fetch-agent` for each request path and give it the following:

- ALL metadata fields from this request (this contains the endpoint)
- RequestPath for this feature from the previous `automation:parent-directory` skill (this is not the endpoint)

ONLY pass the information above and do not add anything else. Spawn all subagents in sequence — NEVER in parallel.

### Step 3: Update task context with usage documentation

Spawn a `secure-fetch-agent` after all requests are created with the following instructions:

#### Instructions

1. Call the `get_secure_fetch_documentation` tool with the `usage` topic
2. Understand how to use the different requests
3. Use the `mcp__plugin_automation_context-forge-mcp__update_task_context` tool to update the task context so that further subtasks have access to the context
4. ALWAYS follow the response format! You only write what's in the response format! Do NOT leave anything out or ADD anything that is not requested

#### Response format

```
# Endpoint name

- Example usage on a page and inside a form so that it's clear for following agents how to use these requests
- Example usage for the endpoint with example values for the pathVariables and the payload (if there is a payload)
```

## Rules

1. Execute steps sequentially — each step depends on the previous
2. Always pass prior findings (paths, created files) to subsequent agents
3. Each agent must update subtask content with its findings
