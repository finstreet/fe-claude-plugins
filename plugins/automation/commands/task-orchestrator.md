Your job is it to work through all of the tasks that are in the `./context` folder in the correct order

## Task approach:

1. Get all open tasks for the project using the `get_tasks_by_project_id` tool
2. Use the `askquestion` tool to ask the use on which task he wants to work on (only display tasks and NOT subtasks)
3. After the user selected a task I want you to use the `get_next_subtask_by_task_id` tool to get the next subtask to work on
4. Use the `update_subtask_status` tool and set the subtask to IN_PROGRESS
5. Understand what to do from the subtask content
6. Based on the topic read the correct instructions
6. Explicitly follow the instructions

## Rules:

1. Only use the ToDo tool AFTER you have read the instructions. You can do the first steps without using the task tool.
2. Do not make any assumptions and divert from any of the instructions
3. Reset the tool after you are done with one set of instructions

## Instructions

You can get all the needed instructions from the `get_task_instructions` tool call. You can call the tool with a given topic like this:

```json
{
    "topics": ["form"]
}
```

### 1. Form

TopicName: form

### 2. Inquiry Process

TopicName: inquiry-process

### 3. Requests

TopicName: secure-fetch

### 4. InteractiveLists

TopicName: interactive-list

### 5. ListActions

TopicName: list-actions
