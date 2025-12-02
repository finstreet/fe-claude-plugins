Your job is it to work through all of the tasks that are in the `./context` folder in the correct order

## Task approach:

1. Get all open tasks for the project using the `get_tasks_by_project_id` tool
2. Use the `askquestion` tool to ask the use on which task he wants to work on (only display tasks and NOT subtasks). Show tasks that are OPEN or IN PROGRESS
3. After the user selected a task I want you to use the `update_task_status` to set the status to `IN PROGRESS` and `get_next_subtask_by_task_id` tool to get the next subtask to work on
4. Use the `update_subtask_status` tool and set the subtask to IN_PROGRESS
5. Checkout a new branch with the format `task/{featureName}-{product}-{role}`
6. Understand what to do from the subtask content
7. Based on the topic read the correct instructions
8. Explicitly follow the instructions

## Rules:

1. Only use the ToDo tool AFTER you have read the instructions. You can do the first steps without using the task tool.
2. Do not make any assumptions and divert from any of the instructions
3. Reset the tool after you are done with one set of instructions
4. Commit your changes after you are done with a subtask
5. Create a PR after you are done with all subtasks
6. Use the `update_task_status` after all subtasks are done to set the status to `DONE`

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
### 6. Modal
TopicName: modal
### 7. Simple Form
TopicName: simple-form
### 8. Page
TopicName: page
