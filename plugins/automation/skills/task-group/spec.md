# Task Group Specification (PO-facing)

## TASK_GROUP — Overview Dashboard

**PO-friendly name:** Overview / Dashboard Panel

**When to use:** When you need an overview page that groups related tasks into visual panels. Each panel can either contain static content or reference other subtasks that the user needs to complete.

**Information to collect:**
- **Name** — Name of the overview (e.g., "Application Overview")
- **Groups** — For each visual group on the page:
  - **Group name** — Technical identifier (e.g., `personalInfo`)
  - **Panels** — For each panel within the group:
    - **Panel name** — Technical identifier (e.g., `addressPanel`)
    - **Panel title** — Display title (e.g., "Address Information")
    - **Panel type** — Either:
      - **Content** — Static text/markdown content
      - **Subtask references** — Links to other subtasks the user must complete. Each reference has:
        - **Action label** — Button text (e.g., "Fill out address")
        - **Subtask name** — Name of the referenced subtask

**Metadata JSON schema:**
```json
[
  {
    "taskGroupName": "personalInfo",
    "taskPanels": [
      {
        "taskPanelName": "addressPanel",
        "title": "Address Information",
        "children": {
          "subtaskType": "content",
          "content": "Please provide your current address details."
        }
      },
      {
        "taskPanelName": "documentsPanel",
        "title": "Required Documents",
        "children": {
          "subtaskType": "subtask",
          "subtasks": [
            { "actionLabel": "Upload ID", "name": "uploadId" },
            { "actionLabel": "Upload Proof of Income", "name": "uploadIncome" }
          ]
        }
      }
    ]
  }
]
```

> **Note:** The TASK_GROUP metadata is an **array** of groups (not an object), unlike other types. Each panel's `children` uses a discriminated union: either `{ subtaskType: "content", content: "..." }` or `{ subtaskType: "subtask", subtasks: [...] }`.
