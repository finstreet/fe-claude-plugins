# Finstreet Frontend Claude Code Plugin

Skills for building Finstreet frontend features with `@finstreet/forms`, `@finstreet/ui`, and related libraries — packaged as a [Claude Code plugin](https://code.claude.com/docs/en/plugins) so every developer on the team gets the same tooling.

## Install

```
/plugin marketplace add finstreet/fe-claude-plugins
/plugin install finstreet-fe@finstreet-plugins
```

## Required setup

The plugin's skills depend on the [Frontend MCP Server](https://github.com/finstreet/frontend-mcp) for live documentation lookups. The MCP defaults to the hosted Fly.io deployment and requires a bearer token.

Add this to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export FINSTREET_MCP_TOKEN=<your-raw-token>
```

Get the token from the team password manager. If you don't have access yet, ask a maintainer to generate one (server-side: `node scripts/gen-token.mjs <your-label>` in `finstreet/frontend-mcp`, then `fly secrets set MCP_TOKENS=...`).

### Pointing at a local MCP server

If you're developing the MCP server itself, override the URL:

```bash
export FINSTREET_MCP_URL=http://localhost:4444/sse
# FINSTREET_MCP_TOKEN can be left unset against a local dev server
```

## Update

```
/plugin marketplace update finstreet-plugins
/plugin update finstreet-fe@finstreet-plugins
```

## Skills

All skills are invoked as `/finstreet-fe:<name>`. Most also trigger automatically based on context.

### Orchestration
- `kickoff` — Decompose a freeform prompt into a skill-annotated task plan
- `workflows` — Dispatcher for feature creation workflows (modal, page, inquiry-process, list-actions, secure-fetch, simple-form, task-group, generic)
- `task-orchestrator` — Work through tasks in a `./context` folder using the Frontend MCP

### Pages & UI
- `page` — Next.js page shells, metadata, header patterns, content wrappers
- `loading` — `loading.tsx` skeleton pages mirroring page content structure
- `ui` — PandaCSS layout primitives + `@finstreet/ui` component composition
- `modal` — Modal store, component, and open button

### Forms
- `form` — Full `@finstreet/forms` flow: options, schema, useFormFields, formAction, defaults, config, FormFields, Form
- `simple-form` — Lightweight action-only forms without input fields
- `inquiry-process` — Multi-step form wizard using `@finstreet/forms` + `@finstreet/ui`

### Lists & task groups
- `list-actions` — Pagination, search, sort, filter, group for `InteractiveList`
- `task-group` — `@finstreet/ui` TaskGroups with panels, actions, status

### Business features
- `document-exchange` — Document upload/download pages with collapsible request groups
- `contract-upload` — Contract upload page for signature process start

### Backend & data
- `secure-fetch` — Type-safe server/client HTTP requests via `@finstreet/secure-fetch`
- `mock-api` — Mock endpoints that plug into the secure-fetch pattern

### Testing
- `e2e-test` — Playwright e2e tests (page objects, fixtures, form modules, dataTestIds)

### Project structure
- `path-resolver` — Resolve feature/backend paths from naming conventions
- `routes` — Add or look up entries in `routes.ts`

### Git workflow
- `new-feature-branch` — Create a branch using Conventional Branch naming
- `commit` — Review, stage, commit, push current changes
- `pr` — Create a PR against `dev` for the current branch

## Task Orchestrator

A general-purpose task runner. Pass it a directory of context files and it works through the tasks one by one, fetching instructions from the Frontend MCP's `get_task_instructions` tool:

```
/finstreet-fe:task-orchestrator Please implement all tasks inside the `./context/master_data` directory.
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to author new skills, test locally, and cut releases.

## Changelog

### 1.0.0
- Renamed plugin from `automation` to `finstreet-fe` (invocations change from `/automation:*` to `/finstreet-fe:*`).
- Renamed marketplace from `fe-plugin` to `finstreet-plugins`.
- Added explicit `plugin.json` manifest, skill index, and contributing guide for team use.

### 0.0.37
- `finstreet-mcp` now defaults to the hosted Fly.io deployment and requires a bearer token. Set `FINSTREET_MCP_TOKEN` in your shell; see README for details. Set `FINSTREET_MCP_URL` to override the URL (useful when developing the MCP server locally).
