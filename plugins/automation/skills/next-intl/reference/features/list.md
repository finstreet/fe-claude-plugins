# List Translations

```json
{
    "{featureName}.{product}.{role}.lists.{listName}": {
        "title": "",
        "columns": {
            // translations for all columns
        },
        "noItems": "",
    }
}
```

## List Actions

Some lists have the ability to filter / sort / group the list. There we will need some more translations in the following form:

```json
{
    "{listName}": {
      "actions": {
        "label": "Suchen & Filtern",
        "search": { // only add this if searching is enabled
            "label": "Suche",
            "placeholder": "Suche nach Anfragen",
        },
        "groupBy": { // only add this if grouping is enabled
            "label": "Gruppieren nach",
            "options": {
                "none": "Keine Gruppierung",
                "status": {
                   "label": "",
                    "titles": {
                        // one title for each status item
                    }
                },
                // for each group by enum the same as for status
            }
        },
        "sortBy": { // only add this if sorting is enabled
            "label": "Sortieren nach",
            "options": {
                "none": "Keine Sortierung",
                "createdAtAsc": "",
                // for each sorting option a translation
            }
        },
        "reset": "Zurücksetzen"
    }
    }
}
```

