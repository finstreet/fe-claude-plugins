Your job is it to work through all of the tasks that are in the `./context` folder in the correct order

## Task approach:

1. List all the files in the `./context` directory
2. Read the file in order (if there status at the bottom is set to done move on to the next task)
3. Understand the users request from the file content and extract the topic from it
4. Based on the topic read the correct instructions
5. Explicitly follow the instructions

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
