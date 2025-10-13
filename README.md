# Official Finstreet Frontend Claude Code Plugin

## Prerequisites

A lot of the functionality of the agents / command from this plugin are tied to the [Frontend MCP Server](https://github.com/finstreet/frontend-mcp). Before you can start using the plugin checkout the `Frontend MCP` and follow the instructions inside repositories Readme. After your finstreet-mcp docker container is running you can go ahead and install the plugin

## Commands

### Task Orchestrator

A general purpose task orchestrator. You can pass a directory to the task orchestrator and it will go through the tasks one by one, fetching it's instructions from the `Frontend MCP - get_task_instructions` tool. 

Usage:

```sh
/automation:task-orchestrator Please implement all tasks inside the `./context/master_data` directory. 
```

## Agents

You can either call these agents individually or let the `task-orchestrator` handle all the heavy lifting by just passing it some tasks with Context files. 