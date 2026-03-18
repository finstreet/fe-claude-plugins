---
name: kickoff
description: "Decomposes a larger prompt into a structured, skill-annotated task plan. Pass it a description of the work you want done and it returns a step-by-step plan where each task is mapped to the right automation skill. Use when starting a new feature, tackling a multi-step request, or when you want Claude Code to work through a complex prompt task by task with progress tracking. Trigger this whenever the user says 'kickoff', 'plan this', 'break this down', 'structure this', or passes a long multi-part prompt they want organized."
user-invocable: true
argument-hint: "<description of the work to be done>"
---

# Kickoff — Prompt Decomposition & Skill Mapping

You take a freeform description of work and turn it into a structured, trackable task plan. Each task is annotated with which skill(s) to invoke, so the user (or an orchestrator) can work through them one by one with full context.

## What You Do

1. **Read the user's prompt** — understand what they want built or changed
2. **Decompose into tasks** — break the work into discrete, ordered steps
3. **Map skills to tasks** — annotate each step with the skill(s) that apply
4. **Create a task list** — use Claude Code's task tools so progress is visible
5. **Present the plan** — show the user the structured plan for confirmation before starting

## How to Decompose

Think about the work in terms of **what needs to exist when it's done** and work backwards:

- Does it need a new API endpoint? → `secure-fetch` first
- Does it need a new page? → `page` (and probably `routes` before it)
- Does it need a form? → `form` (and `page` for the shell)
- Does it need a loading state? → `loading` (after the page exists)
- Does it need e2e tests? → `e2e-test` (after everything else)

Order tasks so that each step's output feeds the next step's input. Backend before frontend. Shell before content. Data before UI.

## Skill Catalog

Reference this catalog when mapping tasks to skills. Each entry describes what the skill does and when to reach for it.

### Backend & Data

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **secure-fetch** | Creates type-safe server/client HTTP request functions using `@finstreet/secure-fetch`. Covers schema, server.ts, and client.ts files. | Any time you need to call a backend API endpoint — GET, POST, PUT, DELETE. Always the first step when backend integration is needed. |
| **mock-api** | Creates mock API endpoints that plug into the secure-fetch pattern. | When the real backend endpoint isn't ready yet and you need to unblock frontend work. |

### Pages & Routing

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **routes** | Resolves, adds, and edits entries in `routes.ts`. | When a new page needs a route, or you need to look up an existing route path. |
| **path-resolver** | Resolves feature and backend file paths based on naming conventions. | When you need to figure out where files should be created for a given feature. Invoke directly: `/path-resolver`. |
| **page** | Builds Next.js page shells — metadata, params, header selection, content wrappers. | When creating a new page. Pages are thin shells; the actual content is built by other skills (form, list, task-group, etc.). |
| **loading** | Builds `loading.tsx` skeleton pages that mirror page content structure. | After a page exists and you want a loading skeleton for it. |

### Forms & Input

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **form** | Full form implementation using `@finstreet/forms` — schema, fields, action, default values, config, and components. | Any multi-field form: create, edit, or inquiry step forms. The most comprehensive skill. |
| **simple-form** | Lightweight action-only forms without input fields (just a submit button). | Confirmation dialogs, one-click actions, or forms with no user input fields. |
| **inquiry-process** | Multi-step form wizard using `@finstreet/forms` and `@finstreet/ui`. | When building a multi-page wizard (e.g., an onboarding flow with progress bar and multiple steps). |

### UI Components & Patterns

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **ui** | Expert guide to PandaCSS layout primitives and `@finstreet/ui` components. | When building any UI component — layout, styling, responsive design, or component composition. |
| **modal** | Implements modals — Zustand store, modal component, and optional open button. | When you need a dialog/modal overlay. |
| **task-group** | Builds TaskGroup patterns — TaskPanels, ActionPanels, and the TaskGroup wrapper. | When displaying a set of tasks a user must complete before proceeding (e.g., checklist-style UI). |
| **list-actions** | Adds pagination, search, sorting, filtering, and grouping to an InteractiveList. | When an existing list needs server-side pagination, search, or sorting capabilities. |
| **contract-upload** | Builds a contract upload page — file upload, scan status, document management, signature process start. | When building a page where users upload contract documents for the signature process. |
| **document-exchange** | Builds document exchange pages — upload, download, and manage documents in collapsible request groups. | When building a page for document management with grouped document requests. |

### Testing & Quality

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **e2e-test** | Writes Playwright e2e tests — form modules, card CRUD, inquiry pages, happy paths. | After a feature is built and you need automated browser tests. |

### Git & Workflow

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **commit** | Reviews, stages, commits, and pushes changes. | When you're done with a piece of work and want to commit. Invoke: `/commit`. |
| **pr** | Creates a pull request for the current branch. | After all work is committed and you want to open a PR. Invoke: `/pr`. |
| **new-feature-branch** | Creates a git branch following Conventional Branch naming. | At the very start of a new feature, before any code changes. |
| **workflows** | Dispatches to the correct end-to-end workflow by type. | When you want to run a complete workflow (modal, page, inquiry-process, etc.) as a single orchestrated flow. |

## Task Plan Format

Present the plan to the user as a numbered list. Each task should have:

1. **Title** — short description of what to do
2. **Skill** — which skill to invoke (or "manual" if no skill applies)
3. **Details** — what specifically needs to happen in this step
4. **Depends on** — which prior tasks must be complete first

### Example

Given a prompt like: *"I need a new page where property managers can upload documents for a financing case. It needs a form for metadata, file upload, and a loading skeleton. The API endpoint exists already."*

The plan would be:

```
## Task Plan

1. **Resolve paths and routes**
   Skill: `path-resolver`, `routes`
   → Determine feature directory and add route to routes.ts

2. **Create page shell**
   Skill: `page`
   → Build the Next.js page with metadata, params, and sub-page header
   Depends on: 1

3. **Build metadata form**
   Skill: `form`
   → Schema, fields, action, default values, config, and form components
   Depends on: 1

4. **Build document upload section**
   Skill: `document-exchange` or `contract-upload`
   → File upload with request groups and status tracking
   Depends on: 1

5. **Assemble page content**
   Skill: `ui`
   → Compose form and upload section into the page content component
   Depends on: 2, 3, 4

6. **Create loading skeleton**
   Skill: `loading`
   → Build loading.tsx that mirrors the page structure
   Depends on: 5

7. **Write e2e tests**
   Skill: `e2e-test`
   → Happy path test covering form submission and file upload
   Depends on: 5
```

## Creating the Task List

After presenting the plan and getting user confirmation, create tasks using Claude Code's task tools:

```
TaskCreate: task 1 title — skill: X — details
TaskCreate: task 2 title — skill: Y — details (depends on: 1)
...
```

This gives the user a live progress tracker. As each task is worked on, update its status to `in_progress`, then `completed` when done.

## Rules

1. **Always present the plan before starting work** — the user should confirm or adjust before you begin
2. **Order matters** — backend before frontend, shell before content, data before UI
3. **One skill per task** where possible — if a task needs two skills, split it into two tasks
4. **Include git tasks** — suggest `new-feature-branch` at the start and `commit`/`pr` at the end if appropriate
5. **Be specific** — don't just say "build the form", say what the form is for, what fields it needs, what the action does
6. **Preserve the user's intent** — the plan should accomplish everything the user asked for, not just the parts that map cleanly to skills
7. **Mark non-skill tasks as "manual"** — some work doesn't have a matching skill, and that's fine
8. **Use `workflows` for end-to-end flows** — if the user's request maps to a single workflow type (e.g., "create a modal"), suggest using `/workflows modal` directly instead of decomposing into individual skills
