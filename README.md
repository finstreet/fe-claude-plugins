# Official Finstreet Frontend Claude Code Plugin

## Prerequisites

A lot of the functionality of the agents / command from this plugin are tied to the [Frontend MCP Server](https://github.com/finstreet/frontend-mcp). Before you can start using the plugin checkout the `Frontend MCP` and follow the instructions inside repositories Readme. After your finstreet-mcp docker container is running you can go ahead and install the plugin

## Configuration

### Configuring the finstreet-mcp server

By default the plugin connects to the production Fly.io deployment.
Each developer needs to set one env var in their shell profile
(`~/.zshrc` or `~/.bashrc`):

```bash
export FINSTREET_MCP_TOKEN=<your-raw-token>
```

Get your token from the team password manager. Ask a maintainer to
generate one for you if you don't have it yet (server-side: `node
scripts/gen-token.mjs <your-label>` in the frontend-mcp repo, then
`fly secrets set MCP_TOKENS=...`).

To point the plugin at a locally-running MCP server instead (e.g. when
developing the MCP itself), override the URL:

```bash
export FINSTREET_MCP_URL=http://localhost:4444/sse
# FINSTREET_MCP_TOKEN can be left unset against a local dev server
```

## Commands

### Task Orchestrator

A general purpose task orchestrator. You can pass a directory to the task orchestrator and it will go through the tasks one by one, fetching it's instructions from the `Frontend MCP - get_task_instructions` tool. 

Usage:

```sh
/automation:task-orchestrator Please implement all tasks inside the `./context/master_data` directory. 
```

## Agents

You can either call these agents individually or let the `task-orchestrator` handle all the heavy lifting by just passing it some tasks with Context files.

## Changelog

### 0.0.37
- `finstreet-mcp` now defaults to the hosted Fly.io deployment and
  requires a bearer token. Set `FINSTREET_MCP_TOKEN` in your shell;
  see README for details. Set `FINSTREET_MCP_URL` to override the URL
  (useful when developing the MCP server locally).
