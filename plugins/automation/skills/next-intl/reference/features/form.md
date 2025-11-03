# Form Translations

## General translation structure

```json
"{featureName}.{product}.{role}.forms.{formName}": {
   "fields": {
    // add translations for all fields here
   }
}
```

## FieldName structure

For fields that are not Array fields the translations are pretty stright forward and you can add them base on the context. Some fields will have an item property where you will get the key and translation from as well. Here is an example

```json
"fields": {
    "{fieldName}": {
        "label": "Label Translation",
        // all other translations here,
        "items": {
            "up_to_2_years": "bis 2 Jahre",
            "up_to_3_years": "bis 3 Jahre",
        }
    }
}
```

## Array Field Structure

Array fields will have a parent field name and will have a list of all child fields as keys. Here it is how it will look like:

```json
"fields": {
    "{arrayFieldName}": {
        "add": "Add Button Caption",
        "{childField}": {
            "label": "Label Translation",
            // all other translations as for the normal fields
        }
    }
}
```