---
name: workflows
description: "Run any feature creation workflow. Pass the workflow type as the first argument. Available types: form, modal, page, inquiry-process, interactive-list, list-actions, secure-fetch, simple-form, task-group, generic."
argument-hint: "<workflow-type> [subtaskId or featureName subFeatureName featureType product role]"
---

# Workflow Dispatcher

Route to the correct workflow based on the first argument.

## Available Workflows

| Type | Description | File |
|------|-------------|------|
| `form` | End-to-end form creation (parent paths, translations, all form files) | [form.md](./form.md) |
| `modal` | End-to-end modal creation (parent paths, translations, modal component) | [modal.md](./modal.md) |
| `page` | End-to-end page creation (routes, translations, page component) | [page.md](./page.md) |
| `inquiry-process` | End-to-end inquiry process creation (routes, parent paths, translations, all files) | [inquiry-process.md](./inquiry-process.md) |
| `interactive-list` | End-to-end interactive list creation (parent paths, translations, list component) | [interactive-list.md](./interactive-list.md) |
| `list-actions` | End-to-end list actions/pagination creation for interactive lists | [list-actions.md](./list-actions.md) |
| `secure-fetch` | End-to-end secure fetch/API request creation (parent paths, schemas, endpoints) | [secure-fetch.md](./secure-fetch.md) |
| `simple-form` | Simple form creation (delegates to form skill) | [simple-form.md](./simple-form.md) |
| `task-group` | End-to-end task group creation (translations, all task group files) | [task-group.md](./task-group.md) |
| `generic` | Generic feature creation (parent paths, general implementation) | [generic.md](./generic.md) |

## Input Contract

- `$ARGUMENTS[0]` — the workflow type (required, one of the types listed above)
- `$ARGUMENTS[1..]` — passed through to the workflow as its input (subtaskId, or positional args like featureName, subFeatureName, featureType, product, role)

## Routing

1. Read `$ARGUMENTS[0]` to determine the workflow type
2. If the type is not recognized, list the available types and ask the user to pick one
3. Load the matching `.md` file from this directory
4. Pass `$ARGUMENTS[1..]` as the workflow's input
5. Follow the loaded workflow instructions exactly

## Rules
1. For each step in a workflow, spawn a new `general-purpose` subagent (if not specified otherwise) and invoke the skill / task inside of the subagent. Never run these in the main thread.
2. Tell all subagents (if not otherwise specified) to not look for patterns in the codebase! They should follow the plan and implement everything according to their instructions! They should only try to find necessary information if absolutely necessary!
