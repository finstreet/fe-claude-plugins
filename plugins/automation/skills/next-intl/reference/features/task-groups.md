# Task Group Translations

## General translation structure

```json
"{featureName}.{product}.{role}.taskGroups": {
      "{taskGroupName}": {
         "label": "",
         "taskPanels": {},
         "actionPanel": {}
      }
   }
}
```

## Task Panel translations

```json
{
    "{taskPanelName}": {
        "label": "",
        // some custom properties might be mentioned in the context as well
        // if there are subtasks
        "subtasks": {
            "{subTaskName}": {
                "title": "",
                "actionLabel: ""
            }
        }
    }
}
```

## Action Panel translations

```json
{
    "{actionPanelName}": {
        "title": "",
        "disabledHint": ""
    }
}
```